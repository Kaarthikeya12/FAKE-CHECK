
"use client"
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Shield, TrendingUp, Users, FileText, CheckCircle, XCircle, AlertCircle, BarChart3, Globe, Clock, ThumbsUp, ThumbsDown, Upload, Link2, Menu, Settings, ChevronRight, Activity, Target, Loader2, Home, MessageCircle } from 'lucide-react';
import { verifyText, verifyUrl, verifyImage, verifyImageUrl, VerificationResult } from '@/lib/api';
import { auth } from '@/firebase/config';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { saveVerificationHistory, getVerificationHistory, getAllVerificationsForTrending, VerificationHistoryItem } from '@/lib/firestore';

export default function FakeCheckDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('verify');
  const [inputType, setInputType] = useState('url');
  
  // Firebase auth
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [verificationHistory, setVerificationHistory] = useState<VerificationHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Stats calculated from verification history
  const [stats, setStats] = useState({
    verificationsToday: 0,
    totalVerifications: 0,
    averageAccuracy: 0,
  });
  
  // Trending data
  const [trendingData, setTrendingData] = useState<{
    trendingNews: Array<{
      title: string;
      category: string;
      verifications: number;
      status: 'true' | 'false' | 'uncertain';
      trend: string;
    }>;
    mostTrendingType: string;
  }>({
    trendingNews: [],
    mostTrendingType: '',
  });
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Form inputs
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Results and state
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationTime, setVerificationTime] = useState<number | null>(null);

  // Load verification history from Firestore
  const loadVerificationHistory = useCallback(async (userId: string) => {
    try {
      setLoadingHistory(true);
      const history = await getVerificationHistory(userId, 1000); // Get more for stats calculation
      setVerificationHistory(history);
      
      // Calculate stats from history
      calculateStats(history);
    } catch (error) {
      console.error('Error loading verification history:', error);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Calculate stats from verification history
  const calculateStats = (history: VerificationHistoryItem[]) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Verifications done today
    const todayCount = history.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= startOfToday;
    }).length;
    
    // Total verifications
    const totalCount = history.length;
    
    // Average accuracy rate
    const scores = history
      .map(item => item.result.credibility_score)
      .filter((score): score is number => score !== undefined && score !== null);
    
    const averageAccuracy = scores.length > 0
      ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
      : 0;
    
    setStats({
      verificationsToday: todayCount,
      totalVerifications: totalCount,
      averageAccuracy,
    });
  };

  // Get status from verdict
  const getStatusFromVerdict = (verdict?: string): 'true' | 'false' | 'uncertain' => {
    const v = verdict?.toUpperCase() || '';
    if (v.includes('TRUE') || v.includes('VERIFIED')) return 'true';
    if (v.includes('FALSE') || v.includes('FAKE')) return 'false';
    return 'uncertain';
  };

  // Load and analyze trending data
  const loadTrendingData = useCallback(async () => {
    try {
      setLoadingTrending(true);
      const allVerifications = await getAllVerificationsForTrending(500);
      
      // Analyze trending news
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Get verifications from last 24 hours
      const recentVerifications = allVerifications.filter(
        item => item.timestamp >= last24Hours
      );
      
      // Group by input text/URL to find most verified items
      const verificationCounts = new Map<string, {
        count: number;
        status: 'true' | 'false' | 'uncertain';
        inputType: string;
        input: string;
      }>();
      
      recentVerifications.forEach(item => {
        const key = item.input.substring(0, 100).toLowerCase();
        const status = getStatusFromVerdict(item.result.verdict);
        
        if (verificationCounts.has(key)) {
          const existing = verificationCounts.get(key)!;
          existing.count++;
        } else {
          verificationCounts.set(key, {
            count: 1,
            status,
            inputType: item.inputType,
            input: item.input,
          });
        }
      });
      
      // Sort by count and get top trending
      const sortedTrending = Array.from(verificationCounts.entries())
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 8)
        .map(([key, data]) => {
          // Categorize based on input content
          const inputLower = data.input.toLowerCase();
          let category = 'General';
          if (inputLower.includes('politic') || inputLower.includes('election') || inputLower.includes('government')) {
            category = 'Politics';
          } else if (inputLower.includes('health') || inputLower.includes('medical') || inputLower.includes('cure') || inputLower.includes('disease')) {
            category = 'Health';
          } else if (inputLower.includes('celebrity') || inputLower.includes('entertainment') || inputLower.includes('movie') || inputLower.includes('music')) {
            category = 'Entertainment';
          } else if (inputLower.includes('science') || inputLower.includes('research') || inputLower.includes('study')) {
            category = 'Science';
          } else if (inputLower.includes('econom') || inputLower.includes('finance') || inputLower.includes('stock') || inputLower.includes('market')) {
            category = 'Finance';
          } else if (inputLower.includes('climate') || inputLower.includes('environment') || inputLower.includes('weather')) {
            category = 'Environment';
          } else if (inputLower.includes('tech') || inputLower.includes('technology') || inputLower.includes('ai') || inputLower.includes('software')) {
            category = 'Technology';
          } else if (inputLower.includes('sport') || inputLower.includes('football') || inputLower.includes('basketball')) {
            category = 'Sports';
          }
          
          // Calculate trend (simplified - based on recent activity)
          const trend = data.count > 10 ? `+${Math.min(50, data.count * 2)}%` : `+${data.count * 3}%`;
          
          return {
            title: data.input.length > 60 ? data.input.substring(0, 60) + '...' : data.input,
            category,
            verifications: data.count,
            status: data.status,
            trend,
          };
        });
      
      // Find most trending type
      const typeCounts = new Map<string, number>();
      sortedTrending.forEach(item => {
        typeCounts.set(item.category, (typeCounts.get(item.category) || 0) + item.verifications);
      });
      
      const mostTrendingType = Array.from(typeCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'General';
      
      setTrendingData({
        trendingNews: sortedTrending,
        mostTrendingType,
      });
    } catch (error) {
      console.error('Error loading trending data:', error);
    } finally {
      setLoadingTrending(false);
    }
  }, [getStatusFromVerdict]);

  // Load trending data when trending tab is active
  useEffect(() => {
    if (activeTab === 'trending' && currentUser) {
      loadTrendingData();
    }
  }, [activeTab, currentUser, loadTrendingData]);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Immediately redirect to signup if not authenticated
        setAuthLoading(false);
        setCurrentUser(null);
        setVerificationHistory([]);
        router.replace('/signup');
        return;
      }
      
      // User is authenticated
      setAuthLoading(false);
      setCurrentUser(user);
      loadVerificationHistory(user.uid);
    });

    return () => unsubscribe();
  }, [loadVerificationHistory, router]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    const startTime = Date.now();

    try {
      let response: VerificationResult;

      if (inputType === 'url') {
        if (!urlInput.trim()) {
          throw new Error('Please enter a URL');
        }
        response = await verifyUrl(urlInput.trim());
      } else if (inputType === 'text') {
        if (!textInput.trim()) {
          throw new Error('Please enter text to verify');
        }
        response = await verifyText(textInput.trim());
      } else if (inputType === 'image') {
        if (!imageFile) {
          throw new Error('Please select an image file');
        }
        response = await verifyImage(imageFile);
      } else {
        throw new Error('Invalid input type');
      }

      setResult(response);
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;
      setVerificationTime(timeTaken);

      // Save to Firestore if user is logged in
      if (currentUser) {
        try {
          const input = inputType === 'url' 
            ? urlInput.trim() 
            : inputType === 'text' 
            ? textInput.trim() 
            : imageFile?.name || 'image';

          await saveVerificationHistory(
            currentUser.uid,
            inputType as 'url' | 'text' | 'image',
            input,
            response,
            timeTaken
          );
          
          // Reload history to show the new entry
          await loadVerificationHistory(currentUser.uid);
        } catch (saveError) {
          console.error('Error saving verification history:', saveError);
          // Don't show error to user, just log it
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during verification');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form when input type changes
  const handleInputTypeChange = (type: string) => {
    setInputType(type);
    setError(null);
    setResult(null);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get verdict color and icon
  const getVerdictStyle = (verdict?: string) => {
    const v = verdict?.toUpperCase() || '';
    if (v.includes('TRUE') || v.includes('VERIFIED')) {
      return {
        color: 'emerald',
        icon: CheckCircle,
        bg: 'from-emerald-500/20 to-emerald-600/20',
        border: 'border-emerald-500/30',
        text: 'text-emerald-500',
        bgIcon: 'bg-emerald-500/10'
      };
    } else if (v.includes('FALSE') || v.includes('FAKE') || v.includes('MISINFORMATION')) {
      return {
        color: 'rose',
        icon: XCircle,
        bg: 'from-rose-500/20 to-rose-600/20',
        border: 'border-rose-500/30',
        text: 'text-rose-500',
        bgIcon: 'bg-rose-500/10'
      };
    } else {
      return {
        color: 'amber',
        icon: AlertCircle,
        bg: 'from-amber-500/20 to-amber-600/20',
        border: 'border-amber-500/30',
        text: 'text-amber-500',
        bgIcon: 'bg-amber-500/10'
      };
    }
  };

  // Format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} sec ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hour${Math.floor(diffInSeconds / 3600) > 1 ? 's' : ''} ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInSeconds / 604800)} week${Math.floor(diffInSeconds / 604800) > 1 ? 's' : ''} ago`;
  };

  // Get title from history item
  const getHistoryTitle = (item: VerificationHistoryItem): string => {
    if (item.inputType === 'url') {
      try {
        const url = new URL(item.input);
        return url.hostname.replace('www.', '');
      } catch {
        return item.input.substring(0, 50);
      }
    } else if (item.inputType === 'text') {
      return item.input.substring(0, 50) + (item.input.length > 50 ? '...' : '');
    } else {
      return item.input || 'Image verification';
    }
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if user is not authenticated (will redirect)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-400">Redirecting to signup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 flex flex-col">
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">FakeCheck</h1>
              <p className="text-xs text-slate-400">AI-Powered Verification</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {/* Recent History Section */}
          <div>
            <div className="flex items-center justify-between px-4 mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification History</p>
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : verificationHistory.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-slate-500">
                  {currentUser ? 'No verification history yet' : 'Login to save verification history'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {verificationHistory.map((item) => {
                  const status = getStatusFromVerdict(item.result.verdict);
                  const title = getHistoryTitle(item);
                  const timeAgo = formatTimeAgo(item.timestamp);
                  
                  return (
                    <div 
                      key={item.id} 
                      className="group px-4 py-3 bg-slate-800/40 hover:bg-slate-800/70 rounded-xl transition-all cursor-pointer border border-slate-800/0 hover:border-slate-700/50"
                      onClick={() => {
                        setResult(item.result);
                        setActiveTab('verify');
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          status === 'true' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' :
                          status === 'false' ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : 'bg-amber-500 shadow-lg shadow-amber-500/50'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-300 font-medium truncate group-hover:text-white transition-colors leading-tight">
                            {title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-500">{timeAgo}</p>
                            {item.result.credibility_score !== undefined && (
                              <>
                                <span className="text-xs text-slate-600">•</span>
                                <p className="text-xs text-slate-500">{item.result.credibility_score}%</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {verificationHistory.length > 0 && (
              <button 
                onClick={() => setActiveTab('verify')}
                className="w-full mt-4 py-2.5 text-sm text-blue-400 hover:text-blue-300 font-semibold transition-colors hover:bg-slate-800/40 rounded-lg"
              >
                View All History →
              </button>
            )}
          </div>
        </nav>

      </aside>

      {/* Main Content */}
      <main className="ml-72">
        {/* Header */}
        <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-10">
          <div className="px-8 py-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">Content Verification Center</h2>
                <p className="text-sm text-slate-400">Analyze news credibility with advanced AI technology</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 pl-4">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{currentUser?.email || 'User'}</p>
                    <p className="text-xs text-slate-400">Premium User</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                    {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await signOut(auth);
                        router.replace('/signup');
                      } catch (error) {
                        console.error('Error signing out:', error);
                      }
                    }}
                    className="ml-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    title="Logout"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('verify')}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                  activeTab === 'verify' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                Verify Content
              </button>
              <button 
                onClick={() => setActiveTab('trending')}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                  activeTab === 'trending' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Trending
              </button>
              <button 
                onClick={() => setActiveTab('community')}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                  activeTab === 'community' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                Community
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                  activeTab === 'analytics' 
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Verify Content Tab */}
          {activeTab === 'verify' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Verification Panel - Takes 3 columns */}
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl">
                  <h3 className="text-xl font-bold text-white mb-2">New Verification Request</h3>
                  <p className="text-sm text-slate-400 mb-8">Submit content for comprehensive AI-powered credibility analysis</p>

                  {/* Input Type Tabs */}
                  <div className="flex gap-3 mb-8">
                    <button
                      onClick={() => handleInputTypeChange('url')}
                      className={`flex-1 py-4 px-5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                        inputType === 'url'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/30'
                          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                      }`}
                    >
                      <Link2 className="w-5 h-5 inline mr-2" />
                      Article URL
                    </button>
                    <button
                      onClick={() => handleInputTypeChange('text')}
                      className={`flex-1 py-4 px-5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                        inputType === 'text'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/30'
                          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                      }`}
                    >
                      <FileText className="w-5 h-5 inline mr-2" />
                      Text Content
                    </button>
                    <button
                      onClick={() => handleInputTypeChange('image')}
                      className={`flex-1 py-4 px-5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                        inputType === 'image'
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-blue-500/30'
                          : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                      }`}
                    >
                      <Upload className="w-5 h-5 inline mr-2" />
                      Image
                    </button>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                        <p className="text-sm text-rose-500 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Input Fields */}
                  {inputType === 'url' && (
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-slate-300 mb-3">Article URL</label>
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://example.com/article"
                        className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all"
                        disabled={loading}
                      />
                    </div>
                  )}

                  {inputType === 'text' && (
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-slate-300 mb-3">Content Text</label>
                      <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Paste the article text or claim you want to verify..."
                        rows={8}
                        className="w-full px-5 py-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 resize-none transition-all"
                        disabled={loading}
                      />
                    </div>
                  )}

                  {inputType === 'image' && (
                    <div className="mb-8">
                      <label className="block text-sm font-semibold text-slate-300 mb-3">Upload Image</label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={loading}
                      />
                      <div
                        onClick={() => !loading && fileInputRef.current?.click()}
                        className={`border-2 border-dashed border-slate-700/50 rounded-xl p-12 text-center hover:border-blue-500 hover:bg-slate-800/30 transition-all cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {imagePreview ? (
                          <div className="space-y-3">
                            <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl shadow-xl" />
                            <p className="text-sm text-slate-400">{imageFile?.name}</p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageFile(null);
                                setImagePreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-14 h-14 text-slate-500 mx-auto mb-4" />
                            <p className="text-slate-300 font-semibold mb-2">Click to upload or drag and drop</p>
                            <p className="text-sm text-slate-500">PNG, JPG, WEBP up to 10MB</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold hover:from-blue-600 hover:to-cyan-600 shadow-2xl shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing Content...
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        Analyze Content
                      </>
                    )}
                  </button>
                </div>

                {/* Verification Result */}
                {result && (
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-8 border-b border-slate-800/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">Verification Result</h3>
                          {verificationTime && (
                            <p className="text-sm text-slate-400">Analysis completed in {verificationTime.toFixed(1)} seconds</p>
                          )}
                        </div>
                        <button className="px-5 py-2.5 bg-slate-800/50 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-800">
                          Export Report
                        </button>
                      </div>
                    </div>

                    <div className="p-8">
                      {(() => {
                        const style = getVerdictStyle(result.verdict);
                        const VerdictIcon = style.icon;
                        const score = result.credibility_score ?? 0;
                        const verdict = result.verdict || 'UNCERTAIN';

                        return (
                          <>
                            {/* Credibility Score */}
                            <div className="flex items-start gap-6 mb-8">
                              <div className="flex-shrink-0">
                                <div className={`w-28 h-28 rounded-2xl bg-gradient-to-br ${style.bg} border-4 ${style.border} flex items-center justify-center shadow-xl`}>
                                  <div className="text-center">
                                    <div className={`text-3xl font-bold ${style.text}`}>{score}%</div>
                                    <div className="text-xs text-slate-400 font-semibold">Score</div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className={`w-12 h-12 rounded-xl ${style.bgIcon} flex items-center justify-center`}>
                                    <VerdictIcon className={`w-6 h-6 ${style.text}`} />
                                  </div>
                                  <div>
                                    <h4 className={`text-2xl font-bold ${style.text}`}>{verdict}</h4>
                                    <p className="text-sm text-slate-400">
                                      {verdict.includes('TRUE') || verdict.includes('VERIFIED')
                                        ? 'High credibility detected'
                                        : verdict.includes('FALSE') || verdict.includes('FAKE')
                                        ? 'Low credibility detected'
                                        : 'Uncertain credibility'}
                                    </p>
                                  </div>
                                </div>
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{ 
                                      width: `${score}%`,
                                      background: style.color === 'emerald' 
                                        ? 'linear-gradient(to right, #10b981, #059669)'
                                        : style.color === 'rose'
                                        ? 'linear-gradient(to right, #f43f5e, #e11d48)'
                                        : 'linear-gradient(to right, #f59e0b, #d97706)'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* Analysis Details */}
                            {result.reasoning && (
                              <div className="bg-slate-800/50 rounded-xl p-5 mb-6">
                                <h5 className="text-sm font-bold text-white mb-3">AI Analysis</h5>
                                <p className="text-slate-300 leading-relaxed">{result.reasoning}</p>
                              </div>
                            )}

                            {/* Extracted Text (for images) */}
                            {result.extracted_text && (
                              <div className="bg-slate-800/50 rounded-xl p-5 mb-6">
                                <h5 className="text-sm font-bold text-white mb-3">Extracted Text</h5>
                                <p className="text-slate-300 leading-relaxed text-sm">{result.extracted_text}</p>
                              </div>
                            )}

                            {/* Red Flags */}
                            {result.red_flags && result.red_flags.length > 0 && (
                              <div className="mb-6">
                                <h5 className="text-sm font-bold text-white mb-4">Red Flags Detected</h5>
                                <div className="space-y-3">
                                  {result.red_flags.map((flag: string, index: number) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                                      <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                                      <p className="text-sm text-slate-300">{flag}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Manipulation Detection */}
                            {result.manipulation_detected !== undefined && (
                              <div className="mb-6">
                                <div className={`p-5 rounded-xl ${result.manipulation_detected ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                                  <div className="flex items-center gap-2">
                                    {result.manipulation_detected ? (
                                      <>
                                        <AlertCircle className="w-6 h-6 text-rose-500" />
                                        <span className="text-base font-bold text-rose-500">Image Manipulation Detected</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        <span className="text-base font-bold text-emerald-500">No Manipulation Detected</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Sources */}
                            {result.sources && result.sources.length > 0 && (
                              <div className="mb-6">
                                <h5 className="text-sm font-bold text-white mb-4">Related Sources</h5>
                                <div className="space-y-3">
                                  {result.sources.map((source: any, index: number) => (
                                    <a
                                      key={index}
                                      href={source.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${
                                          source.credibility?.toLowerCase().includes('high') || source.credibility?.toLowerCase().includes('true')
                                            ? 'bg-emerald-500'
                                            : source.credibility?.toLowerCase().includes('low') || source.credibility?.toLowerCase().includes('false')
                                            ? 'bg-rose-500'
                                            : 'bg-amber-500'
                                        }`}></div>
                                        <div>
                                          <p className="text-sm text-slate-300 group-hover:text-white transition-colors font-medium">{source.title || source.url}</p>
                                          {source.credibility && (
                                            <p className="text-xs text-slate-500">{source.credibility}</p>
                                          )}
                                        </div>
                                      </div>
                                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-400" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Community Feedback Section */}
                            <div className="border-t border-slate-800 pt-8 mt-8">
                              <div className="flex items-center justify-between mb-5">
                                <div>
                                  <h5 className="text-base font-bold text-white mb-1">Community Feedback</h5>
                                  <p className="text-xs text-slate-400">Help improve verification accuracy</p>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Users className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-400 font-semibold">156 votes</span>
                                </div>
                              </div>

                              {/* Vote Buttons */}
                              <div className="grid grid-cols-2 gap-4 mb-6">
                                <button className="flex items-center justify-center gap-3 px-5 py-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl hover:bg-emerald-500/20 transition-colors group">
                                  <ThumbsUp className="w-6 h-6 text-emerald-500" />
                                  <div className="text-left">
                                    <div className="text-sm font-bold text-emerald-500">Agree</div>
                                    <div className="text-xs text-slate-400">134 votes (86%)</div>
                                  </div>
                                </button>
                                <button className="flex items-center justify-center gap-3 px-5 py-4 bg-rose-500/10 border border-rose-500/30 rounded-xl hover:bg-rose-500/20 transition-colors group">
                                  <ThumbsDown className="w-6 h-6 text-rose-500" />
                                  <div className="text-left">
                                    <div className="text-sm font-bold text-rose-500">Disagree</div>
                                    <div className="text-xs text-slate-400">22 votes (14%)</div>
                                  </div>
                                </button>
                              </div>

                              {/* Consensus Bar */}
                              <div className="mb-6">
                                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                                  <span className="font-semibold">Community Consensus</span>
                                  <span className="font-semibold">86% agreement</span>
                                </div>
                                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full w-[86%] bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
                                </div>
                              </div>

                              {/* Add Source Form */}
                              <div className="bg-slate-800/30 rounded-xl p-5 mb-5">
                                <h6 className="text-sm font-bold text-white mb-4">Add Your Source</h6>
                                <div className="space-y-3">
                                  <div className="flex gap-3">
                                    <button className="flex-1 py-2.5 px-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-500 text-sm font-bold hover:bg-emerald-500/20 transition-colors">
                                      Support
                                    </button>
                                    <button className="flex-1 py-2.5 px-4 bg-slate-700 border border-slate-600 rounded-lg text-slate-300 text-sm font-bold hover:bg-slate-600 transition-colors">
                                      Dispute
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Source URL"
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                  />
                                  <textarea
                                    placeholder="Add a comment (optional)"
                                    rows={2}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 resize-none"
                                  />
                                  <button className="w-full py-3 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors">
                                    Submit Source
                                  </button>
                                </div>
                              </div>

                              {/* User Submitted Sources */}
                              <div>
                                <h6 className="text-sm font-bold text-white mb-4">Community Sources (12)</h6>
                                <div className="space-y-3">
                                  {[
                                    { user: 'Sarah M.', type: 'supporting', url: 'reuters.com/article', comment: 'Reuters confirms this story with additional details', votes: 45, time: '2h ago' },
                                    { user: 'Mike R.', type: 'supporting', url: 'apnews.com/article', comment: 'AP News has similar coverage', votes: 32, time: '4h ago' },
                                    { user: 'Alex T.', type: 'disputing', url: 'snopes.com/fact-check', comment: 'Snopes rates this as mostly false', votes: 8, time: '5h ago' },
                                  ].map((item, i) => (
                                    <div key={i} className={`p-4 rounded-xl border ${
                                      item.type === 'supporting' 
                                        ? 'bg-emerald-500/5 border-emerald-500/20' 
                                        : 'bg-rose-500/5 border-rose-500/20'
                                    }`}>
                                      <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-7 h-7 rounded-lg ${
                                            item.type === 'supporting' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                                          } flex items-center justify-center`}>
                                            {item.type === 'supporting' ? (
                                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                                            ) : (
                                              <XCircle className="w-4 h-4 text-rose-500" />
                                            )}
                                          </div>
                                          <div>
                                            <p className="text-sm font-semibold text-white">{item.user}</p>
                                            <p className="text-xs text-slate-400">{item.time}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <button className="p-1 hover:bg-slate-700 rounded">
                                            <ThumbsUp className="w-4 h-4 text-slate-400" />
                                          </button>
                                          <span className="text-xs text-slate-400 font-semibold">{item.votes}</span>
                                        </div>
                                      </div>
                                      <p className="text-sm text-slate-300 mb-2">{item.comment}</p>
                                      <a href={`https://${item.url}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium">
                                        {item.url}
                                        <ChevronRight className="w-3 h-3" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                                <button className="w-full mt-4 py-2.5 text-sm text-blue-400 hover:text-blue-300 font-bold transition-colors">
                                  View All Sources (12) →
                                </button>
                              </div>
                            </div>

                            {/* Additional Data */}
                            {Object.keys(result).filter(key => !['verdict', 'credibility_score', 'reasoning', 'sources', 'red_flags', 'extracted_text', 'manipulation_detected'].includes(key)).length > 0 && (
                              <div className="border-t border-slate-800 pt-8 mt-8">
                                <h5 className="text-sm font-bold text-white mb-4">Additional Information</h5>
                                <div className="grid grid-cols-2 gap-4">
                                  {Object.entries(result)
                                    .filter(([key]) => !['verdict', 'credibility_score', 'reasoning', 'sources', 'red_flags', 'extracted_text', 'manipulation_detected'].includes(key))
                                    .map(([key, value]) => (
                                      <div key={key} className="bg-slate-800/50 rounded-xl p-5">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Activity className="w-4 h-4 text-slate-400" />
                                          <span className="text-xs text-slate-400 uppercase font-bold">{key.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="text-lg font-bold text-white">
                                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* No Result Message */}
                {!result && !loading && !error && (
                  <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-16 text-center shadow-2xl">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                      <Search className="w-10 h-10 text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-400 mb-2">No Verification Yet</h3>
                    <p className="text-sm text-slate-500">Submit content above to see detailed verification results</p>
                  </div>
                )}
              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                {/* Verification Tips */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-2xl">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-base">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    Verification Tips
                  </h3>
                  <div className="space-y-3 text-sm text-slate-400">
                    <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                      <p>Check multiple sources before sharing</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                      <p>Look for author credentials and dates</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                      <p>Verify images with reverse search</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                      <p>Be skeptical of sensational headlines</p>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-colors">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                      <p>Check the publication date</p>
                    </div>
                  </div>
                </div>

                {/* Stats Card */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 shadow-2xl">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-base">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                    </div>
                    Your Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 font-semibold uppercase">Verifications Today</span>
                        <Activity className="w-4 h-4 text-blue-400" />
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{stats.verificationsToday}</p>
                      <p className="text-xs text-slate-400 font-semibold">Checked today</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-green-500/10 rounded-xl border border-emerald-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 font-semibold uppercase">Overall Accuracy Rate</span>
                        <Target className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{stats.averageAccuracy}%</p>
                      <p className="text-xs text-slate-400 font-semibold">Average of all verifications</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 font-semibold uppercase">Total News Uploaded</span>
                        <FileText className="w-4 h-4 text-purple-400" />
                      </div>
                      <p className="text-3xl font-bold text-white mb-1">{stats.totalVerifications}</p>
                      <p className="text-xs text-slate-400 font-semibold">All time verifications</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trending Tab */}
          {activeTab === 'trending' && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Trending Verifications</h3>
                      <p className="text-xs text-slate-400">
                        Most checked content in last 24 hours
                        {trendingData.mostTrendingType && (
                          <span className="ml-2 text-blue-400">• {trendingData.mostTrendingType} trending</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {loadingTrending ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                  </div>
                ) : trendingData.trendingNews.length === 0 ? (
                  <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No trending verifications yet</p>
                    <p className="text-sm text-slate-500 mt-2">Start verifying content to see trending topics</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trendingData.trendingNews.map((item, i) => (
                      <div key={i} className="group p-4 bg-slate-800/40 hover:bg-slate-800/70 rounded-xl transition-all cursor-pointer border border-slate-800/0 hover:border-slate-700/50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${
                              item.status === 'true' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' :
                              item.status === 'false' ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : 'bg-amber-500 shadow-lg shadow-amber-500/50'
                            }`}></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">{item.title}</p>
                              <div className="flex items-center gap-3 text-xs text-slate-400">
                                <span className="px-2 py-1 bg-slate-700/50 rounded-md font-medium">{item.category}</span>
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {item.verifications} check{item.verifications !== 1 ? 's' : ''}
                                </span>
                                <span className="text-emerald-500 font-semibold">{item.trend}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-slate-400 flex-shrink-0 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Community Tab */}
          {activeTab === 'community' && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-16 text-center shadow-2xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                  <Users className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">Community Section</h3>
                <p className="text-sm text-slate-500">Coming soon - Connect with other fact-checkers</p>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-16 text-center shadow-2xl">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">Analytics Dashboard</h3>
                <p className="text-sm text-slate-500">Coming soon - View detailed statistics and trends</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

