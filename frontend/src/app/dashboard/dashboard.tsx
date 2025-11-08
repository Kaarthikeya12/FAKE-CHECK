"use client";

import React, { useState } from "react";
import {
  Search,
  Shield,
  TrendingUp,
  Clock,
  Settings,
  Bell,
  ChevronRight,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  X,
  MessageSquare,
  Home,
} from "lucide-react";

export default function FakeCheckDashboard() {
  return <h2>Dashboard</h2>;
}
// const FakeCheckDashboard = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeView, setActiveView] = useState('dashboard');

//   const previousChecks = [
//     { id: 1, title: "Climate change statistics 2024", score: 87, status: "Likely True", time: "2 hours ago" },
//     { id: 2, title: "New vaccine side effects claim", score: 34, status: "Likely False", time: "5 hours ago" },
//     { id: 3, title: "Economic growth report", score: 72, status: "Mostly True", time: "1 day ago" },
//     { id: 4, title: "Celebrity scandal news", score: 28, status: "Likely False", time: "2 days ago" },
//   ];

//   const collaborators = [
//     { name: "Sarah Mitchell", role: "Fact Checker", avatar: "SM", comment: "Great analysis! The sources are well-verified.", time: "5 min ago" },
//     { name: "James Chen", role: "Moderator", avatar: "JC", comment: "I found some conflicting data on this topic. Need more investigation.", time: "12 min ago" },
//     { name: "Emily Rodriguez", role: "Analyst", avatar: "ER", comment: "Cross-checked with multiple databases. Results are accurate.", time: "1 hour ago" },
//     { name: "David Kim", role: "Researcher", avatar: "DK", comment: "Added additional sources to support the verification.", time: "2 hours ago" },
//     { name: "Lisa Wang", role: "Fact Checker", avatar: "LW", comment: "The sentiment analysis shows high bias in the original content.", time: "3 hours ago" },
//     { name: "Michael Brown", role: "Analyst", avatar: "MB", comment: "Domain reputation check completed successfully.", time: "5 hours ago" },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
//       {/* Header */}
//       <header className="border-b border-slate-800/50 backdrop-blur-sm bg-slate-900/30">
//         <div className="w-full px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
//               <Shield className="w-6 h-6" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold">FakeCheck</h1>
//               <p className="text-xs text-slate-400">AI Verification</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             <button className="relative p-2 hover:bg-slate-800 rounded-lg transition">
//               <Bell className="w-5 h-5" />
//               <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
//             </button>
//             <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
//               <div className="text-right">
//                 <p className="text-sm font-medium">John Doe</p>
//                 <p className="text-xs text-slate-400">Premium User</p>
//               </div>
//               <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center font-bold">
//                 JD
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="flex">
//         {/* Sidebar */}
//         <aside className="w-64 border-r border-slate-800/50 min-h-screen bg-slate-900/20 p-6">
//           <nav className="space-y-2">
//             <button
//             onClick={() => setActiveView('dashboard')}
//             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
//               activeView === 'dashboard'
//                 ? 'bg-slate-800 text-white'
//                 : 'text-slate-400 hover:bg-slate-800 hover:text-white'
//             }`}
//             >
//               <BarChart3 className="w-5 h-5" />
//               Dashboard
//             </button>
//             <button
//               onClick={() => setActiveView('history')}
//               className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
//                 activeView === 'history'
//                   ? 'bg-slate-800 text-white'
//                   : 'text-slate-400 hover:bg-slate-800 hover:text-white'
//               }`}
//             >
//               <Clock className="w-5 h-5" />
//               History
//             </button>
// 3 px-4 py-3 rounded-lg transition ${
//                 activeView === 'trending'
//                   ? 'bg-slate-800 text-white'
//                   : 'text-slate-400 hover:bg-slate-800 hover:text-white'
//               }`}
//             >
//               <TrendingUp className="w-5 h-5" />
//               Trending
//             </button>
//           </nav>

//           {/* Your Stats */}
//           <div className="mt-8 bg-gradient-to-br from-slate-800/50 to-slate-800/30 border border-slate-700/50 rounded-xl p-5">
//             <h4 className="font-bold mb-4 flex items-center gap-2">
//               <BarChart3 className="w-5 h-5 text-cyan-400" />
//               Your Stats
//             </h4>
//             <div className="space-y-3">
//               <div className="flex justify-between items-center">
//                 <span className="text-slate-400 text-sm">Verifications Today</span>
//                 <span className="font-bold text-xl">24</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-slate-400 text-sm">Accuracy Rate</span>
//                 <span className="font-bold text-xl text-green-400">94%</span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-slate-400 text-sm">Community Points</span>
//                 <span className="font-bold text-xl text-cyan-400">1,847</span>
//               </div>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content */}
//         <main className="flex-1 p-8">
//           <div className="max-w-4xl mx-auto">
//             {/* Dashboard View */}
//             {activeView === 'dashboard' && (
//               <>
//                 {/* Welcome Section */}
//                 <div className="mb-8">
//                   <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                     Welcome back, John
//                   </h2>
//                   <p className="text-slate-400">Verify news credibility with AI-powered analysis</p>
//                 </div>

//                 {/* Search Bar */}
//                 <div className="mb-12">
//                   <div className="relative">
//                     <input
//                       type="text"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       placeholder="Paste a URL or enter text to verify..."
//                       className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-5 pl-14 text-lg focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition"
//                     />
//                     <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
//                     <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 rounded-xl font-medium hover:opacity-90 transition">
//                       Verify Now
//                     </button>
//                   </div>
//                   <div className="flex gap-2 mt-4">
//                     <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition">
//                       Upload Image
//                     </button>
//                     <button className="px-4 py-2 bg-slate-800/50 hover:bg-slate-800 rounded-lg text-sm text-slate-300 transition">
//                       Advanced Options
//                     </button>
//                   </div>
//                 </div>

//                 {/* Collaborators Section - YouTube Comment Style */}
//                 <div className="mb-12">
//                   <div className="flex items-center gap-2 mb-6">
//                     <MessageSquare className="w-5 h-5" />
//                     <h3 className="text-xl font-bold">Community Activity</h3>
//                     <span className="text-slate-400 text-sm ml-2">{collaborators.length} comments</span>
//                   </div>
//                   <div className="space-y-4">
//                     {collaborators.map((collab, idx) => (
//                       <div key={idx} className="flex gap-3">
//                         <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
//                           {collab.avatar}
//                         </div>
//                         <div className="flex-1">
//                           <div className="flex items-center gap-2 mb-1">
//                             <span className="font-semibold text-sm">{collab.name}</span>
//                             <span className="text-slate-500 text-xs">•</span>
//                             <span className="text-slate-400 text-xs">{collab.time}</span>
//                           </div>
//                           <p className="text-slate-300 text-sm mb-2">{collab.comment}</p>
//                           <div className="flex items-center gap-4 text-xs text-slate-400">
//                             <button className="hover:text-white transition">Reply</button>
//                             <button className="hover:text-white transition">👍 12</button>
//                             <button className="hover:text-white transition">👎</button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </>
//             )}

//             {/* History View */}
//             {activeView === 'history' && (
//               <div>
//                 <div className="mb-8">
//                   <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                     Verification History
//                   </h2>
//                   <p className="text-slate-400">Your past content verifications</p>
//                 </div>
//                 <div className="flex flex-col items-center justify-center py-24 text-center">
//                   <Clock className="w-20 h-20 text-slate-700 mb-4" />
//                   <h4 className="text-xl font-semibold text-slate-400 mb-2">No History Yet</h4>
//                   <p className="text-slate-500">Your verification history will appear here after you start checking content</p>
//                 </div>
//               </div>
//             )}

//             {/* Trending View */}
//             {activeView === 'trending' && (
//               <div>
//                 <div className="mb-8">
//                   <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                     Trending Searches
//                   </h2>
//                   <p className="text-slate-400">Popular topics being verified right now</p>
//                 </div>
//                 <div className="flex flex-col items-center justify-center py-24 text-center">
//                   <TrendingUp className="w-20 h-20 text-slate-700 mb-4" />
//                   <h4 className="text-xl font-semibold text-slate-400 mb-2">No Trending Searches Yet</h4>
//                   <p className="text-slate-500">Start verifying content to see trending topics appear here</p>
//                 </div>
//               </div>
//             )}

//             {/* Stats View */}
//             {activeView === 'stats' && (
//               <div>
//                 <div className="mb-8">
//                   <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
//                     Your Stats
//                   </h2>
//                   <p className="text-slate-400">Track your verification activity and performance</p>
//                 </div>
//                 <div className="flex flex-col items-center justify-center py-24 text-center">
//                   <BarChart3 className="w-20 h-20 text-slate-700 mb-4" />
//                   <h4 className="text-xl font-semibold text-slate-400 mb-2">No Stats Available Yet</h4>
//                   <p className="text-slate-500">Your statistics will appear here once you start verifying content</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </main>

//         {/* Right Sidebar */}
//         <aside className="w-80 border-l border-slate-800/50 bg-slate-900/20 p-6 overflow-y-auto">
//           {/* Recent Verifications */}
//           <div>
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="font-bold flex items-center gap-2">
//                 <Clock className="w-5 h-5 text-cyan-400" />
//                 Recent Verifications
//               </h3>
//             </div>
//             <div className="space-y-3">
//               {previousChecks.map((check) => (
//                 <div key={check.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 hover:border-slate-600 transition cursor-pointer">
//                   <div className="flex items-start gap-2 mb-2">
//                     {check.score > 70 ?
//                       <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> :
//                       <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
//                     }
//                     <div className="flex-1 min-w-0">
//                       <h4 className="font-medium text-sm mb-1 line-clamp-2">{check.title}</h4>
//                       <p className="text-xs text-slate-400">{check.time}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <span className={`text-xs font-medium ${
//                       check.score > 70 ? 'text-green-400' : check.score > 40 ? 'text-yellow-400' : 'text-red-400'
//                     }`}>
//                       {check.status}
//                     </span>
//                     <div className={`text-lg font-bold ${
//                       check.score > 70 ? 'text-green-400' : check.score > 40 ? 'text-yellow-400' : 'text-red-400'
//                     }`}>
//                       {check.score}%
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </aside>
//       </div>
//     </div>
//   );
// };

// export default FakeCheckDashboard;
