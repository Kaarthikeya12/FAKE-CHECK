// src/lib/firestore.ts
import { 
  collection,
  doc,
  setDoc,
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { VerificationResult } from './api';

export interface VerificationHistoryItem {
  id?: string;
  userId: string;
  inputType: 'url' | 'text' | 'image';
  input: string; // URL, text content, or image filename
  result: VerificationResult;
  timestamp: Date;
  verificationTime?: number; // Time taken in seconds
}

export interface UserData {
  uid: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Save user credentials to Firestore
export async function saveUserToFirestore(
  uid: string,
  email: string,
  name: string
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    
    const userData: UserData = {
      uid,
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(userRef, userData, { merge: true });
    console.log('✅ User saved to Firestore:', uid);
  } catch (error) {
    console.error('❌ Error saving user to Firestore:', error);
    throw error;
  }
}

// Get user data from Firestore
export async function getUserFromFirestore(uid: string): Promise<UserData | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        uid: data.uid,
        email: data.email,
        name: data.name,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching user from Firestore:', error);
    throw error;
  }
}

// Save verification result to Firestore as subcollection
export async function saveVerificationHistory(
  userId: string,
  inputType: 'url' | 'text' | 'image',
  input: string,
  result: VerificationResult,
  verificationTime?: number
): Promise<string> {
  try {
    // Use subcollection: users/{userId}/verificationHistory
    const userRef = doc(db, 'users', userId);
    const historyRef = collection(userRef, 'verificationHistory');
    
    const historyData = {
      inputType,
      input: inputType === 'text' ? input.substring(0, 200) : input, // Limit text to 200 chars
      result,
      timestamp: Timestamp.now(),
      verificationTime: verificationTime || null,
      createdAt: Timestamp.now(),
    };

    const docRef = await addDoc(historyRef, historyData);
    console.log('✅ Verification history saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving verification history:', error);
    throw error;
  }
}

// Get verification history for a user from subcollection
export async function getVerificationHistory(
  userId: string,
  limitCount: number = 50
): Promise<VerificationHistoryItem[]> {
  try {
    // Use subcollection: users/{userId}/verificationHistory
    const userRef = doc(db, 'users', userId);
    const historyRef = collection(userRef, 'verificationHistory');
    
    // No need for composite index when using subcollections
    const q = query(
      historyRef,
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const history: VerificationHistoryItem[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      history.push({
        id: doc.id,
        userId,
        inputType: data.inputType,
        input: data.input,
        result: data.result,
        timestamp: data.timestamp.toDate(),
        verificationTime: data.verificationTime || undefined,
      });
    });

    return history;
  } catch (error) {
    console.error('❌ Error fetching verification history:', error);
    throw error;
  }
}

// Get a single verification by ID from subcollection
export async function getVerificationById(
  userId: string,
  verificationId: string
): Promise<VerificationHistoryItem | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const verificationRef = doc(userRef, 'verificationHistory', verificationId);
    const docSnap = await getDoc(verificationRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId,
        inputType: data.inputType,
        input: data.input,
        result: data.result,
        timestamp: data.timestamp.toDate(),
        verificationTime: data.verificationTime || undefined,
      };
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching verification:', error);
    throw error;
  }
}

// Get all verifications from all users for trending analysis
export async function getAllVerificationsForTrending(
  limitCount: number = 100
): Promise<VerificationHistoryItem[]> {
  try {
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const allVerifications: VerificationHistoryItem[] = [];
    
    // Get verifications from each user's subcollection
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userRef = doc(db, 'users', userId);
      const historyRef = collection(userRef, 'verificationHistory');
      
      const q = query(
        historyRef,
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );
      
      const historySnapshot = await getDocs(q);
      historySnapshot.forEach((doc) => {
        const data = doc.data();
        allVerifications.push({
          id: doc.id,
          userId,
          inputType: data.inputType,
          input: data.input,
          result: data.result,
          timestamp: data.timestamp.toDate(),
          verificationTime: data.verificationTime || undefined,
        });
      });
    }
    
    // Sort by timestamp (most recent first)
    allVerifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return allVerifications.slice(0, limitCount);
  } catch (error) {
    console.error('❌ Error fetching all verifications for trending:', error);
    throw error;
  }
}
