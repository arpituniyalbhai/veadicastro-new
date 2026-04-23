import React, { useState } from 'react';
import { Home, MessageSquare, DollarSign, Send, Mic, RefreshCw, Plus } from 'lucide-react';

export default function VedicChatPage() {
  const [activeNav, setActiveNav] = useState('chat');
  const [inputValue, setInputValue] = useState('');

  const suggestions = [
    "Will I overcome self-doubt in my life?",
    "Is this a good time for a job change?",
    "How will my finances look this month?",
    "What should I focus on for personal growth?"
  ];

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'chat', icon: MessageSquare, label: 'New Chat' },
    { id: 'pricing', icon: DollarSign, label: 'Pricing' }
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Starfield Background */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Left Sidebar */}
      <div className="w-20 bg-gradient-to-b from-[#0f0f1a] to-[#1a1a2e] border-r border-gray-800/50 flex flex-col items-center py-8 gap-8 relative z-10 shadow-2xl">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            className={`p-3 rounded-xl transition-all duration-300 relative group ${
              activeNav === item.id
                ? 'bg-gradient-to-br from-pink-500/20 to-purple-600/20 shadow-lg shadow-pink-500/20'
                : 'hover:bg-white/5'
            }`}
            title={item.label}
          >
            <item.icon 
              className={`w-6 h-6 transition-all duration-300 ${
                activeNav === item.id
                  ? 'text-pink-400'
                  : 'text-gray-400 group-hover:text-gray-200 group-hover:scale-110'
              }`}
            />
            {activeNav === item.id && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Top User Info */}
        <div className="px-8 py-6 border-b border-gray-800/50 bg-gradient-to-b from-[#0f0f1a]/80 to-transparent backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-lg font-semibold shadow-lg shadow-pink-500/30">
              AU
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Arpit</h2>
              <p className="text-sm text-gray-400">Asking for yourself</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 border border-gray-700/50 hover:border-pink-500/30 group">
              <Plus className="w-4 h-4 text-pink-400 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-sm">Add Member</span>
            </button>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto px-8 py-12 flex flex-col items-center justify-center">
          <div className="max-w-4xl w-full space-y-8">
            {/* Suggestions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(suggestion)}
                  className="p-5 rounded-2xl bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/10 transition-all duration-300 text-left group backdrop-blur-sm hover:scale-[1.02]"
                >
                  <p className="text-sm text-gray-300 group-hover:text-white transition-colors duration-300">
                    {suggestion}
                  </p>
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <div className="flex justify-center">
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-pink-400 transition-all duration-300 group">
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span>Refresh suggestions</span>
              </button>
            </div>

            {/* Questions Counter */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                <span className="text-pink-400 font-semibold">0</span> Questions left
              </p>
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="px-8 py-6 border-t border-gray-800/50 bg-gradient-to-t from-[#0f0f1a]/80 to-transparent backdrop-blur-sm">
          <div className="max-w-4xl mx-auto">
            <div className="relative flex items-center gap-3 bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-2xl p-4 focus-within:border-pink-500/50 focus-within:shadow-lg focus-within:shadow-pink-500/10 transition-all duration-300 backdrop-blur-sm">
              <button className="p-2 rounded-lg hover:bg-white/5 transition-all duration-300 group">
                <Mic className="w-5 h-5 text-gray-400 group-hover:text-pink-400 transition-colors duration-300" />
              </button>
              
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask your question here…"
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && inputValue.trim()) {
                    // Handle send
                    setInputValue('');
                  }
                }}
              />
              
              <button 
                className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 transition-all duration-300 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!inputValue.trim()}
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}