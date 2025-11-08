"use client";

import React, { useState } from "react";
import {
  Search,
  Shield,
  TrendingUp,
  Clock,
  Bell,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

const FakeCheckDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeView, setActiveView] = useState("dashboard");

  const previousChecks = [
    {
      id: 1,
      title: "Climate change statistics 2024",
      score: 87,
      status: "Likely True",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "New vaccine side effects claim",
      score: 34,
      status: "Likely False",
      time: "5 hours ago",
    },
    {
      id: 3,
      title: "Economic growth report",
      score: 72,
      status: "Mostly True",
      time: "1 day ago",
    },
    {
      id: 4,
      title: "Celebrity scandal news",
      score: 28,
      status: "Likely False",
      time: "2 days ago",
    },
  ];

  const collaborators = [
    {
      name: "Sarah Mitchell",
      role: "Fact Checker",
      avatar: "SM",
      comment: "Great analysis! The sources are well-verified.",
      time: "5 min ago",
    },
    {
      name: "James Chen",
      role: "Moderator",
      avatar: "JC",
      comment: "Found conflicting data. Needs more review.",
      time: "12 min ago",
    },
    {
      name: "Emily Rodriguez",
      role: "Analyst",
      avatar: "ER",
      comment: "Cross-checked sources. Looks accurate.",
      time: "1 hour ago",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-[#161b22] flex flex-col">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="bg-cyan-600 p-2 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">FakeCheck</h1>
            <p className="text-xs text-gray-400">AI Verification</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { name: "Dashboard", icon: BarChart3, id: "dashboard" },
            { name: "History", icon: Clock, id: "history" },
            { name: "Trending", icon: TrendingUp, id: "trending" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeView === item.id
                  ? "bg-cyan-700/20 text-cyan-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
          © 2025 FakeCheck
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-gray-800 bg-[#161b22] p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Welcome, John</h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-800 rounded-lg transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-gray-500">Premium User</p>
              </div>
              <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center font-bold">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeView === "dashboard" && (
            <>
              {/* Search */}
              <div className="mb-10">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Paste a URL or enter text to verify..."
                    className="w-full bg-[#0d1117] border border-gray-700 rounded-xl px-6 py-4 pl-12 text-base focus:outline-none focus:ring-2 focus:ring-cyan-600"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-500 px-5 py-2 rounded-lg font-medium text-sm transition">
                    Verify
                  </button>
                </div>
              </div>

              {/* Collaborator Comments */}
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-6">
                  <MessageSquare className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-semibold">Community Activity</h3>
                </div>
                <div className="space-y-4">
                  {collaborators.map((c, i) => (
                    <div
                      key={i}
                      className="bg-[#161b22] border border-gray-800 rounded-xl p-4"
                    >
                      <div className="flex gap-3 items-start">
                        <div className="w-10 h-10 bg-cyan-700 rounded-full flex items-center justify-center font-bold text-sm">
                          {c.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{c.name}</span>
                            <span className="text-gray-500 text-xs">
                              • {c.time}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">{c.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* History */}
          {activeView === "history" && (
            <div className="text-center py-24">
              <Clock className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No History Yet</h3>
              <p className="text-gray-500">
                Your verification history will appear here.
              </p>
            </div>
          )}

          {/* Trending */}
          {activeView === "trending" && (
            <div className="text-center py-24">
              <TrendingUp className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Trending Topics Yet
              </h3>
              <p className="text-gray-500">
                Start verifying content to see trending topics.
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 border-l border-gray-800 bg-[#161b22] p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Recent Verifications
          </h3>
          <div className="space-y-3">
            {previousChecks.map((check) => (
              <div
                key={check.id}
                className="bg-[#0d1117] border border-gray-800 rounded-lg p-4 hover:border-gray-600 transition"
              >
                <div className="flex items-start gap-2 mb-2">
                  {check.score > 70 ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  )}
                  <div>
                    <h4 className="text-sm font-medium">{check.title}</h4>
                    <p className="text-xs text-gray-500">{check.time}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`text-xs font-medium ${
                      check.score > 70
                        ? "text-green-400"
                        : check.score > 40
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {check.status}
                  </span>
                  <span
                    className={`font-bold ${
                      check.score > 70
                        ? "text-green-400"
                        : check.score > 40
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {check.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
};

export default FakeCheckDashboard;
