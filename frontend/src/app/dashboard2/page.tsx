'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

interface SearchHistory {
  id: string;
  text: string;
  timestamp: string;
  result: string;
}


export default function FakeNewsDetector() {
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Mock search history - will be replaced with database fetch
  const [searchHistory] = useState<SearchHistory[]>([
    {
      id: '1',
      text: 'Climate change article from...',
      timestamp: '2 hours ago',
      result: 'Verified'
    },
    {
      id: '2',
      text: 'Political news about...',
      timestamp: '5 hours ago',
      result: 'Fake'
    },
    {
      id: '3',
      text: 'Health update on...',
      timestamp: '1 day ago',
      result: 'Verified'
    }
  ]);


  const handleDetectNews = async () => {
    if (!inputValue.trim()) return;

    setIsAnalyzing(true);
    
    // Backend call - replace with actual API endpoint
    console.log('Calling backend with:', inputValue);
    
    // Simulate API call
    setTimeout(() => {
      const mockResponse = {
        status: 'analyzed',
        credibility_score: 75,
        verdict: 'Mostly True',
        sources_checked: 5,
        fact_checks: [
          { claim: 'Sample claim 1', status: 'true' },
          { claim: 'Sample claim 2', status: 'unverified' }
        ]
      };
      
      console.log('Backend response:', mockResponse);
      setAnalysisResult(mockResponse);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="flex h-screen">
        {/* Left Sidebar - Search History */}
        <div className="w-64 bg-slate-900/50 border-r border-slate-800 shadow-lg p-4 overflow-y-auto">
          <h2 className="text-xl font-bold text-white mb-4">Search History</h2>
          <div className="space-y-3">
            {searchHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 cursor-pointer transition border border-slate-700/50"
              >
                <p className="text-sm text-gray-300 truncate">{item.text}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">{item.timestamp}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      item.result === 'Verified'
                        ? 'bg-green-900/50 text-green-400 border border-green-700/50'
                        : 'bg-red-900/50 text-red-400 border border-red-700/50'
                    }`}
                  >
                    {item.result}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header with Circular Profile Icon */}
          <div className="bg-slate-900/30 border-b border-slate-800/50 backdrop-blur-sm p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Fake News Detector
            </h1>
            <button className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/20 border border-cyan-400/20">
              <User className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Center Content */}
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-3xl">
              {/* Input Section */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl shadow-2xl p-8 mb-8">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                  Analyze News Authenticity
                </h2>
                
                <div className="space-y-4">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Paste news text or URL here..."
                    className="w-full h-32 px-4 py-3 bg-slate-900/50 border-2 border-slate-700 rounded-lg focus:border-cyan-500 focus:outline-none resize-none text-white placeholder-gray-500"
                  />
                  
                  <button
                    onClick={handleDetectNews}
                    disabled={isAnalyzing || !inputValue.trim()}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-lg font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed transition shadow-lg shadow-cyan-500/20"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Detect News'}
                  </button>
                </div>
              </div>

              {/* Results */}
              {analysisResult && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg p-6">
                  <h3 className="text-2xl font-bold text-white mb-4">Analysis Result</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-cyan-900/20 rounded-lg border border-cyan-700/30">
                      <span className="font-semibold text-gray-300">Credibility Score:</span>
                      <span className="text-2xl font-bold text-cyan-400">
                        {analysisResult.credibility_score}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-green-900/20 rounded-lg border border-green-700/30">
                      <span className="font-semibold text-gray-300">Verdict:</span>
                      <span className="text-lg font-bold text-green-400">
                        {analysisResult.verdict}
                      </span>
                    </div>
                    {/* Add more sections here later */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}