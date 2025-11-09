// API configuration and utility functions for backend endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Optional: Save to Firestore after verification
export interface SaveVerificationOptions {
  userId?: string;
  inputType?: 'url' | 'text' | 'image';
  input?: string;
  verificationTime?: number;
}

export interface VerificationResult {
  verdict?: string;
  credibility_score?: number;
  extracted_text?: string;
  manipulation_detected?: boolean;
  red_flags?: string[];
  reasoning?: string;
  sources?: Array<{
    title: string;
    url: string;
    credibility: string;
  }>;
  [key: string]: any;
}

export interface ApiError {
  error: string;
  message?: string;
  example?: any;
}

// Health check
export async function checkHealth(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Health check failed');
    return await response.json();
  } catch (error) {
    throw new Error('Backend service unavailable');
  }
}

// Verify text claim
export async function verifyText(text: string): Promise<VerificationResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: Verification failed`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Please ensure the backend is running.`);
    }
    throw new Error(error.message || 'Failed to verify text');
  }
}

// Verify URL/article
export async function verifyUrl(url: string): Promise<VerificationResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: Verification failed`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Please ensure the backend is running.`);
    }
    throw new Error(error.message || 'Failed to verify URL');
  }
}

// Verify uploaded image
export async function verifyImage(file: File): Promise<VerificationResult> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/verify/image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: Verification failed`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Please ensure the backend is running.`);
    }
    throw new Error(error.message || 'Failed to verify image');
  }
}

// Verify image from URL
export async function verifyImageUrl(imageUrl: string): Promise<VerificationResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify/image/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_url: imageUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}: Verification failed`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Please ensure the backend is running.`);
    }
    throw new Error(error.message || 'Failed to verify image URL');
  }
}

