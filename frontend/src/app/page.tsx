"use client"
import { useState, useRef } from 'react';
import { Search, Shield, TrendingUp, Users, FileText, CheckCircle, XCircle, AlertCircle, BarChart3, Globe, Clock, ThumbsUp, ThumbsDown, Upload, Link2, Menu, Bell, Settings, ChevronRight, Activity, Target, Zap, Loader2 } from 'lucide-react';
import { verifyText, verifyUrl, verifyImage, verifyImageUrl, VerificationResult } from '@/lib/api';

export default function FakeCheckDashboard() {
  const [activeTab, setActiveTab] = useState('verify');
  const [inputType, setInputType] = useState('url');
  
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
      setVerificationTime((endTime - startTime) / 1000);
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

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">FakeCheck</h1>
              <p className="text-xs text-slate-400">AI Verification</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-500/10 text-blue-400 font-medium">
              <Search className="w-5 h-5" />
              <span>Verify</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <Activity className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
              <span>History</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5" />
              <span>Trending</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
              <Target className="w-5 h-5" />
              <span>Analytics</span>
            </button>
          </div>

          <div className="mt-8">
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase mb-3">Settings</p>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
                <span>Preferences</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-white">Pro Plan</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Unlimited verifications</p>
            <button className="w-full py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors">
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        {/* Header */}
        <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Content Verification</h2>
              <p className="text-sm text-slate-400">Analyze and verify news credibility with AI</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">John Doe</p>
                  <p className="text-xs text-slate-400">Premium User</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                  JD
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">+12.5%</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">2,847</h3>
              <p className="text-sm text-slate-400">Verified True</p>
              <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[68%] bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-rose-500" />
                </div>
                <span className="text-xs font-medium text-rose-500 bg-rose-500/10 px-2.5 py-1 rounded-full">+8.2%</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">1,523</h3>
              <p className="text-sm text-slate-400">Detected False</p>
              <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[45%] bg-rose-500 rounded-full"></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-500" />
                </div>
                <span className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">+5.1%</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">892</h3>
              <p className="text-sm text-slate-400">Uncertain</p>
              <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[32%] bg-amber-500 rounded-full"></div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-xs font-medium text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full">+23.4%</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">12.5K</h3>
              <p className="text-sm text-slate-400">Active Users</p>
              <div className="mt-4 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-[82%] bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Verification Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-1">New Verification</h3>
                <p className="text-sm text-slate-400 mb-6">Submit content for AI-powered credibility analysis</p>

                {/* Input Type Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => handleInputTypeChange('url')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                      inputType === 'url'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Link2 className="w-4 h-4 inline mr-2" />
                    Article URL
                  </button>
                  <button
                    onClick={() => handleInputTypeChange('text')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                      inputType === 'text'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <FileText className="w-4 h-4 inline mr-2" />
                    Text Content
                  </button>
                  <button
                    onClick={() => handleInputTypeChange('image')}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                      inputType === 'image'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    <Upload className="w-4 h-4 inline mr-2" />
                    Image
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                      <p className="text-sm text-rose-500 font-medium">{error}</p>
                    </div>
                  </div>
                )}

                {/* Input Fields */}
                {inputType === 'url' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Article URL</label>
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/article"
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      disabled={loading}
                    />
                  </div>
                )}

                {inputType === 'text' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Content Text</label>
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Paste the article text or claim you want to verify..."
                      rows={8}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                      disabled={loading}
                    />
                  </div>
                )}

                {inputType === 'image' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Upload Image</label>
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
                      className={`border-2 border-dashed border-slate-700 rounded-lg p-12 text-center hover:border-blue-500 hover:bg-slate-800/50 transition-all cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {imagePreview ? (
                        <div className="space-y-3">
                          <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                          <p className="text-sm text-slate-400">{imageFile?.name}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setImageFile(null);
                              setImagePreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="text-xs text-rose-400 hover:text-rose-300"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                          <p className="text-slate-300 font-medium mb-1">Click to upload or drag and drop</p>
                          <p className="text-sm text-slate-500">PNG, JPG, WEBP up to 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3.5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Analyze Content
                    </>
                  )}
                </button>
              </div>

              {/* Verification Result */}
              {result && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">Verification Result</h3>
                        {verificationTime && (
                          <p className="text-sm text-slate-400">Analysis completed in {verificationTime.toFixed(1)} seconds</p>
                        )}
                      </div>
                      <button className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-700">
                        Export Report
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    {(() => {
                      const style = getVerdictStyle(result.verdict);
                      const VerdictIcon = style.icon;
                      const score = result.credibility_score ?? 0;
                      const verdict = result.verdict || 'UNCERTAIN';

                      return (
                        <>
                          {/* Credibility Score */}
                          <div className="flex items-start gap-6 mb-6">
                            <div className="flex-shrink-0">
                              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${style.bg} border-4 ${style.border} flex items-center justify-center`}>
                                <div className="text-center">
                                  <div className={`text-2xl font-bold ${style.text}`}>{score}%</div>
                                  <div className="text-xs text-slate-400">Score</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-lg ${style.bgIcon} flex items-center justify-center`}>
                                  <VerdictIcon className={`w-5 h-5 ${style.text}`} />
                                </div>
                                <div>
                                  <h4 className={`text-xl font-bold ${style.text}`}>{verdict}</h4>
                                  <p className="text-sm text-slate-400">
                                    {verdict.includes('TRUE') || verdict.includes('VERIFIED')
                                      ? 'High credibility detected'
                                      : verdict.includes('FALSE') || verdict.includes('FAKE')
                                      ? 'Low credibility detected'
                                      : 'Uncertain credibility'}
                                  </p>
                                </div>
                              </div>
                              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full"
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
                            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                              <h5 className="text-sm font-semibold text-white mb-2">Analysis</h5>
                              <p className="text-slate-300 leading-relaxed">{result.reasoning}</p>
                            </div>
                          )}

                          {/* Extracted Text (for images) */}
                          {result.extracted_text && (
                            <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
                              <h5 className="text-sm font-semibold text-white mb-2">Extracted Text</h5>
                              <p className="text-slate-300 leading-relaxed text-sm">{result.extracted_text}</p>
                            </div>
                          )}

                          {/* Red Flags */}
                          {result.red_flags && result.red_flags.length > 0 && (
                            <div className="mb-6">
                              <h5 className="text-sm font-semibold text-white mb-3">Red Flags</h5>
                              <div className="space-y-2">
                                {result.red_flags.map((flag: string, index: number) => (
                                  <div key={index} className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                                    <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-slate-300">{flag}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Manipulation Detection */}
                          {result.manipulation_detected !== undefined && (
                            <div className="mb-6">
                              <div className={`p-4 rounded-lg ${result.manipulation_detected ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'}`}>
                                <div className="flex items-center gap-2">
                                  {result.manipulation_detected ? (
                                    <>
                                      <AlertCircle className="w-5 h-5 text-rose-500" />
                                      <span className="text-sm font-semibold text-rose-500">Image Manipulation Detected</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                                      <span className="text-sm font-semibold text-emerald-500">No Manipulation Detected</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Sources */}
                          {result.sources && result.sources.length > 0 && (
                            <div className="mb-6">
                              <h5 className="text-sm font-semibold text-white mb-3">Related Sources</h5>
                              <div className="space-y-2">
                                {result.sources.map((source: any, index: number) => (
                                  <a
                                    key={index}
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors group"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-2 h-2 rounded-full ${
                                        source.credibility?.toLowerCase().includes('high') || source.credibility?.toLowerCase().includes('true')
                                          ? 'bg-emerald-500'
                                          : source.credibility?.toLowerCase().includes('low') || source.credibility?.toLowerCase().includes('false')
                                          ? 'bg-rose-500'
                                          : 'bg-amber-500'
                                      }`}></div>
                                      <div>
                                        <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{source.title || source.url}</p>
                                        {source.credibility && (
                                          <p className="text-xs text-slate-500">{source.credibility}</p>
                                        )}
                                      </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-400" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Additional Data */}
                          {Object.keys(result).filter(key => !['verdict', 'credibility_score', 'reasoning', 'sources', 'red_flags', 'extracted_text', 'manipulation_detected'].includes(key)).length > 0 && (
                            <div className="border-t border-slate-800 pt-6">
                              <h5 className="text-sm font-semibold text-white mb-3">Additional Information</h5>
                              <div className="grid grid-cols-2 gap-4">
                                {Object.entries(result)
                                  .filter(([key]) => !['verdict', 'credibility_score', 'reasoning', 'sources', 'red_flags', 'extracted_text', 'manipulation_detected'].includes(key))
                                  .map(([key, value]) => (
                                    <div key={key} className="bg-slate-800/50 rounded-lg p-4">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Activity className="w-4 h-4 text-slate-400" />
                                        <span className="text-xs text-slate-400 uppercase font-medium">{key.replace(/_/g, ' ')}</span>
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
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
                  <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-400 mb-2">No Verification Yet</h3>
                  <p className="text-sm text-slate-500">Submit content above to see verification results</p>
                </div>
              )}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Recent Checks</h3>
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-3">
                  {[
                    { title: 'Breaking: Major Policy Announced', status: 'false', time: '2 min ago', source: 'news-daily.com' },
                    { title: 'Study: New Medical Discovery', status: 'true', time: '18 min ago', source: 'nature.com' },
                    { title: 'Celebrity Scandal Update', status: 'uncertain', time: '1 hour ago', source: 'gossip-hub.net' },
                    { title: 'Economic Forecast Released', status: 'true', time: '3 hours ago', source: 'economist.com' },
                    { title: 'Viral Social Media Claim', status: 'false', time: '5 hours ago', source: 'twitter.com' }
                  ].map((item, i) => (
                    <div key={i} className="group p-3 bg-slate-800/30 hover:bg-slate-800 rounded-lg transition-all cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          item.status === 'true' ? 'bg-emerald-500' :
                          item.status === 'false' ? 'bg-rose-500' : 'bg-amber-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-300 font-medium truncate group-hover:text-white transition-colors">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-slate-500">{item.source}</p>
                            <span className="text-slate-700">•</span>
                            <p className="text-xs text-slate-500">{item.time}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                  View All History
                </button>
              </div>

              {/* Trending Topics */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Trending Now</h3>
                  <TrendingUp className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-3">
                  {[
                    { tag: 'Election2024', count: 1247, trend: 'up' },
                    { tag: 'HealthNews', count: 892, trend: 'up' },
                    { tag: 'TechBreakthrough', count: 743, trend: 'up' },
                    { tag: 'ClimateAction', count: 621, trend: 'down' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border border-blue-500/10 rounded-lg hover:border-blue-500/30 transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-400 font-semibold">#{item.tag}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{item.count} checks</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${item.trend === 'up' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Your Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Verifications Today</span>
                    <span className="text-lg font-bold text-white">24</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Accuracy Rate</span>
                    <span className="text-lg font-bold text-emerald-500">94%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Community Points</span>
                    <span className="text-lg font-bold text-blue-400">1,847</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}