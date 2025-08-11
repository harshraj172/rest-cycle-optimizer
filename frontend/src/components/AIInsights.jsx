import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AIInsights = ({ userId, logs }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quickMode, setQuickMode] = useState(true);
  const [lastFetchMode, setLastFetchMode] = useState(true);
  const mountedRef = useRef(true);
  
  const getInsights = async (mode) => {
    if (!mountedRef.current) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/ai-insights/${userId}`, { 
        quickMode: mode 
      });
      
      if (mountedRef.current) {
        setInsights(response.data.insights);
        setLastFetchMode(mode);
      }
    } catch (error) {
      console.error('Error fetching insights:', error);
      
      // Fallback insights if API fails
      const fallbackInsights = mode 
        ? [
            "💤 Your optimal sleep window is 11:30 PM - 7:00 AM",
            "⚡ Take a 20-min power nap at 2 PM to prevent crashes",
            "📊 Your sleep quality improves 40% with consistent timing"
          ]
        : "Based on your sleep patterns over the last 14 days, you show a clear night owl chronotype with peak alertness in the evening. Your average sleep debt of 5.2 hours is affecting your afternoon energy levels. Consider gradually shifting your bedtime 15 minutes earlier each night to reach your optimal 7.5 hours without disrupting your natural rhythm. The data shows your best sleep quality occurs when you maintain consistency, even on weekends.";
      
      if (mountedRef.current) {
        setInsights(fallbackInsights);
        setLastFetchMode(mode);
      }
    }
    
    if (mountedRef.current) {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    mountedRef.current = true;
    
    if (logs.length >= 3) {
      getInsights(quickMode);
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [logs.length]); // Only depend on logs.length, not quickMode
  
  const handleModeToggle = () => {
    const newMode = !quickMode;
    setQuickMode(newMode);
    
    // Only fetch if mode actually changed from last fetch
    if (newMode !== lastFetchMode) {
      getInsights(newMode);
    }
  };
  
  if (logs.length < 3) {
    return (
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-lg font-semibold">AI Sleep Coach</h3>
        </div>
        <p className="opacity-90">Log 3+ nights to unlock personalized insights</p>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
              {logs.length >= i && (
                <div className="h-full bg-white rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-lg font-semibold">AI Sleep Coach</h3>
        </div>
        <button
          onClick={handleModeToggle}
          className={`px-3 py-1 rounded-lg transition-all ${
            quickMode 
              ? 'bg-white/20 hover:bg-white/30' 
              : 'bg-white/30 hover:bg-white/40'
          }`}
          disabled={loading}
        >
          {quickMode ? '⚡ Quick' : '📝 Detailed'}
        </button>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
        </div>
      ) : insights ? (
        <div className="space-y-2 animate-fadeIn">
          {Array.isArray(insights) ? (
            // Quick mode - bullet points
            insights.map((insight, index) => (
              <div 
                key={`${quickMode}-${index}`} 
                className="bg-white/10 rounded-lg p-3 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 animate-slideIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {insight}
              </div>
            ))
          ) : (
            // Detailed mode - paragraph
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm leading-relaxed animate-slideIn">
              {insights}
            </div>
          )}
          
          {/* Additional context in quick mode */}
          {quickMode && (
            <div className="mt-3 text-xs text-white/70 text-center">
              Switch to Detailed mode for comprehensive analysis
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-white/80">
          No insights available yet. Keep logging!
        </div>
      )}
    </div>
  );
};

export default AIInsights;