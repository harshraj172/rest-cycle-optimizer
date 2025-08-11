import React, { useState, useEffect, useMemo } from 'react';
import { Moon, Sun, Home, BarChart3, Sparkles, TrendingUp, Battery, Clock, Calendar, ChevronRight, Check, AlertCircle, Zap, Brain, Activity, Target } from 'lucide-react';
import axios from 'axios';
import AIInsights from './components/AIInsights';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Utility functions
const analyzePatterns = (logs) => {
  if (!logs || logs.length === 0) {
    return {
      avgSleep: 0,
      avgQuality: 0,
      sleepDebt: 0,
      efficiency: 0,
      consistency: 0,
      chronotype: 'unknown'
    };
  }
  
  const recentLogs = logs.slice(-7);
  const avgSleep = recentLogs.reduce((acc, log) => acc + log.hours, 0) / recentLogs.length;
  const avgQuality = recentLogs.reduce((acc, log) => acc + log.quality, 0) / recentLogs.length;
  const optimalSleep = 7.5;
  const sleepDebt = Math.max(0, recentLogs.reduce((acc, log) => acc + (optimalSleep - log.hours), 0));
  
  const sleepStd = Math.sqrt(
    recentLogs.reduce((acc, log) => acc + Math.pow(log.hours - avgSleep, 2), 0) / recentLogs.length
  );
  const consistency = Math.max(0, 100 - (sleepStd * 20));
  const efficiency = Math.min(100, (avgQuality / 5) * 60 + (avgSleep / optimalSleep) * 40);
  
  const avgMorningEnergy = recentLogs.reduce((acc, log) => acc + (log.morningEnergy || 3), 0) / recentLogs.length;
  const avgEveningEnergy = recentLogs.reduce((acc, log) => acc + (log.eveningEnergy || 3), 0) / recentLogs.length;
  const chronotype = avgMorningEnergy > avgEveningEnergy + 0.5 ? 'morning lark' : 
                     avgEveningEnergy > avgMorningEnergy + 0.5 ? 'night owl' : 'intermediate';
  
  return { avgSleep, avgQuality, sleepDebt, efficiency, consistency, chronotype };
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Components
const SleepDebtIndicator = ({ debt }) => {
  const getStatus = () => {
    if (debt < 5) return { level: 'good', color: 'green', message: 'Great job! Well-rested' };
    if (debt < 10) return { level: 'warning', color: 'amber', message: 'Consider catching up' };
    return { level: 'danger', color: 'red', message: 'Priority: recover sleep' };
  };
  
  const status = getStatus();
  const colorClasses = {
    green: 'bg-green-100 text-green-800 border-green-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-red-100 text-red-800 border-red-200'
  };
  
  return (
    <div className={`rounded-2xl p-4 border-2 ${colorClasses[status.color]} transition-all duration-300 transform hover:scale-[1.02]`}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-white/50">
          {status.level === 'good' && <Check className="w-6 h-6" />}
          {status.level === 'warning' && <AlertCircle className="w-6 h-6" />}
          {status.level === 'danger' && <Battery className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-lg">Sleep Debt: {debt.toFixed(1)} hours</div>
          <div className="text-sm opacity-80">{status.message}</div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, progress, icon, color = 'indigo' }) => {
  const gradients = {
    indigo: 'from-indigo-500 to-purple-600',
    blue: 'from-blue-500 to-cyan-600',
    purple: 'from-purple-500 to-pink-600'
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500 dark:text-gray-400 text-sm">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${gradients[color]} transition-all duration-500`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  );
};

const QuickLogForm = ({ onSubmit, userId }) => {
  const [dateType, setDateType] = useState('last-night');
  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState(3);
  const [tags, setTags] = useState([]);
  const [showEnergy, setShowEnergy] = useState(false);
  const [morningEnergy, setMorningEnergy] = useState(3);
  const [afternoonEnergy, setAfternoonEnergy] = useState(3);
  const [eveningEnergy, setEveningEnergy] = useState(3);
  
  const availableTags = ['All-nighter', 'Exam week', 'Exercise', 'Sick', 'Caffeine late', 'Stress'];
  
  const handleSubmit = async () => {
    const logDate = dateType === 'last-night' 
      ? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    const logData = {
      userId,
      date: logDate,
      hours,
      quality,
      tags,
      morningEnergy,
      afternoonEnergy,
      eveningEnergy
    };
    
    try {
      await axios.post(`${API_URL}/sleep-logs`, logData);
      onSubmit();
      // Reset form
      setHours(7);
      setQuality(3);
      setTags([]);
      setShowEnergy(false);
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setDateType('last-night')}
          className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
            dateType === 'last-night' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Last Night
        </button>
        <button
          onClick={() => setDateType('today')}
          className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all ${
            dateType === 'today' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Today
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Hours Slept
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHours(Math.max(0, hours - 0.5))}
              className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              -
            </button>
            <div className="flex-1 text-center py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-lg font-semibold">
              {hours}h
            </div>
            <button
              onClick={() => setHours(Math.min(14, hours + 0.5))}
              className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Quality
          </label>
          <div className="flex gap-1 justify-center py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setQuality(star)}
                className={`text-2xl transition-all transform hover:scale-110 ${
                  star <= quality ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          Context Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTags(tags.includes(tag) 
                ? tags.filter(t => t !== tag)
                : [...tags, tag]
              )}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                tags.includes(tag)
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      
      <button
        onClick={() => setShowEnergy(!showEnergy)}
        className="w-full py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium flex items-center justify-between hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Energy Levels (Optional)
        </span>
        <ChevronRight className={`w-4 h-4 transition-transform ${showEnergy ? 'rotate-90' : ''}`} />
      </button>
      
      {showEnergy && (
        <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
          {[
            { label: 'Morning', value: morningEnergy, setter: setMorningEnergy, emoji: '🌅' },
            { label: 'Afternoon', value: afternoonEnergy, setter: setAfternoonEnergy, emoji: '☀️' },
            { label: 'Evening', value: eveningEnergy, setter: setEveningEnergy, emoji: '🌙' }
          ].map(({ label, value, setter, emoji }) => (
            <div key={label} className="text-center">
              <div className="text-sm font-medium mb-2">
                <div>{emoji}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
              </div>
              <div className="flex flex-col-reverse items-center gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => setter(level)}
                    className={`w-full h-2 rounded-full transition-all ${
                      level <= value
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs mt-1 text-gray-500">{value}/5</div>
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={handleSubmit}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
      >
        <Clock className="w-5 h-5" />
        Log Sleep
      </button>
    </div>
  );
};

// Main App Component
export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sleepLogs, setSleepLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = 'demo-user'; // In production, get from auth
  
  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/sleep-logs/${userId}`);
      setSleepLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    fetchLogs();
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
  }, []);
  
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  
  const patterns = useMemo(() => analyzePatterns(sleepLogs), [sleepLogs]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your sleep data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Moon className="w-7 h-7" />
                Rest Cycle
              </h1>
              <p className="text-sm opacity-90 mt-0.5">Your personalized sleep companion</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {currentPage === 'dashboard' ? (
          <div className="space-y-6">
            <SleepDebtIndicator debt={patterns.sleepDebt} />
            
            <div className="grid grid-cols-3 gap-3">
              <MetricCard
                label="Efficiency"
                value={`${Math.round(patterns.efficiency)}%`}
                progress={patterns.efficiency}
                icon={<Target className="w-4 h-4 text-indigo-500" />}
                color="indigo"
              />
              <MetricCard
                label="Avg Sleep"
                value={`${patterns.avgSleep.toFixed(1)}h`}
                progress={(patterns.avgSleep / 10) * 100}
                icon={<Clock className="w-4 h-4 text-blue-500" />}
                color="blue"
              />
              <MetricCard
                label="Consistency"
                value={`${Math.round(patterns.consistency)}%`}
                progress={patterns.consistency}
                icon={<Brain className="w-4 h-4 text-purple-500" />}
                color="purple"
              />
            </div>
            
            <AIInsights userId={userId} logs={sleepLogs} />
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Quick Sleep Log
              </h3>
              <QuickLogForm onSubmit={fetchLogs} userId={userId} />
            </div>
            
            {sleepLogs.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {sleepLogs.slice(0, 5).map((log) => (
                    <div key={log._id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(log.date)}
                        </div>
                        <div className="font-medium">{log.hours}h</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm">{'⭐'.repeat(log.quality)}</div>
                        {log.tags?.includes('All-nighter') && (
                          <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 text-xs font-medium">
                            All-nighter
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Analytics Page
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-indigo-500" />
                Sleep Analytics
              </h2>
              
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Weekly Average</div>
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {patterns.avgSleep.toFixed(1)}h
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Quality: {'⭐'.repeat(Math.round(patterns.avgQuality))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sleep Debt</div>
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {patterns.sleepDebt.toFixed(1)}h
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Last 7 days
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Consistency</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.round(patterns.consistency)}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Sleep regularity
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Chronotype</div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400 capitalize">
                    {patterns.chronotype === 'night owl' ? '🦉 Night Owl' : 
                     patterns.chronotype === 'morning lark' ? '🌅 Morning Lark' : 
                     '🌤️ Flexible'}
                  </div>
                </div>
              </div>
            </div>

            {/* Sleep Trend Chart */}
            {sleepLogs.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  30-Day Sleep Trend
                </h3>
                
                <div className="relative h-64">
                  <div className="absolute inset-0 flex items-end justify-between gap-1">
                    {sleepLogs.slice(0, 30).reverse().map((log, index) => {
                      const maxHours = 12;
                      const targetHours = 7.5;
                      const height = (log.hours / maxHours) * 100;
                      const isGood = log.hours >= targetHours;
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center group relative">
                          <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                            <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                              {log.hours}h | {'⭐'.repeat(log.quality)}
                              <br />
                              {formatDate(log.date)}
                            </div>
                          </div>
                          
                          <div
                            className={`w-full rounded-t transition-all duration-300 hover:opacity-80 ${
                              isGood 
                                ? 'bg-gradient-to-t from-green-500 to-emerald-400' 
                                : log.hours < 5 
                                  ? 'bg-gradient-to-t from-red-500 to-orange-400'
                                  : 'bg-gradient-to-t from-indigo-500 to-purple-400'
                            }`}
                            style={{ height: `${height}%` }}
                          />
                          
                          {index % 7 === 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 rotate-45 origin-left">
                              {formatDate(log.date)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div 
                    className="absolute w-full border-t-2 border-dashed border-green-400 dark:border-green-600"
                    style={{ bottom: '62.5%' }}
                  >
                    <span className="absolute -top-5 right-0 text-xs text-green-600 dark:text-green-400 bg-white dark:bg-gray-800 px-1">
                      Target: 7.5h
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gradient-to-t from-green-500 to-emerald-400 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Good (≥7.5h)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gradient-to-t from-indigo-500 to-purple-400 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Moderate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gradient-to-t from-red-500 to-orange-400 rounded"></div>
                    <span className="text-gray-600 dark:text-gray-400">Poor</span>
                  </div>
                </div>
              </div>
            )}

            {/* Energy Heatmap */}
            {sleepLogs.length >= 7 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Energy Pattern Heatmap
                </h3>
                
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-8 gap-1 text-xs min-w-[400px]">
                    <div></div>
                    {sleepLogs.slice(0, 7).reverse().map((log, i) => {
                      const date = new Date(log.date);
                      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                      return (
                        <div key={i} className="text-center text-gray-500 dark:text-gray-400">
                          {days[date.getDay()]}
                          <div className="text-xs">{date.getDate()}</div>
                        </div>
                      );
                    })}
                    
                    <div className="text-right pr-2 text-gray-500 dark:text-gray-400 flex items-center justify-end">
                      🌅 Morning
                    </div>
                    {sleepLogs.slice(0, 7).reverse().map((log, i) => {
                      const value = log.morningEnergy || 3;
                      const colors = [
                        'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200',
                        'bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
                        'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
                        'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200',
                        'bg-emerald-300 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200'
                      ];
                      return (
                        <div
                          key={`morning-${i}`}
                          className={`aspect-square rounded flex items-center justify-center font-semibold ${colors[value - 1]}`}
                        >
                          {value}
                        </div>
                      );
                    })}
                    
                    <div className="text-right pr-2 text-gray-500 dark:text-gray-400 flex items-center justify-end">
                      ☀️ Afternoon
                    </div>
                    {sleepLogs.slice(0, 7).reverse().map((log, i) => {
                      const value = log.afternoonEnergy || 3;
                      const colors = [
                        'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200',
                        'bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
                        'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
                        'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200',
                        'bg-emerald-300 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200'
                      ];
                      return (
                        <div
                          key={`afternoon-${i}`}
                          className={`aspect-square rounded flex items-center justify-center font-semibold ${colors[value - 1]}`}
                        >
                          {value}
                        </div>
                      );
                    })}
                    
                    <div className="text-right pr-2 text-gray-500 dark:text-gray-400 flex items-center justify-end">
                      🌙 Evening
                    </div>
                    {sleepLogs.slice(0, 7).reverse().map((log, i) => {
                      const value = log.eveningEnergy || 3;
                      const colors = [
                        'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200',
                        'bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
                        'bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
                        'bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200',
                        'bg-emerald-300 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200'
                      ];
                      return (
                        <div
                          key={`evening-${i}`}
                          className={`aspect-square rounded flex items-center justify-center font-semibold ${colors[value - 1]}`}
                        >
                          {value}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 mt-4 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Low</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(v => {
                      const colors = [
                        'bg-red-200 dark:bg-red-900',
                        'bg-orange-200 dark:bg-orange-900',
                        'bg-yellow-200 dark:bg-yellow-900',
                        'bg-green-200 dark:bg-green-900',
                        'bg-emerald-300 dark:bg-emerald-800'
                      ];
                      return (
                        <div key={v} className={`w-4 h-4 rounded ${colors[v - 1]}`} />
                      );
                    })}
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">High</span>
                </div>
              </div>
            )}

            {/* Pattern Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Sleep Pattern Insights
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="text-2xl">
                    {patterns.chronotype === 'night owl' ? '🦉' : 
                     patterns.chronotype === 'morning lark' ? '🌅' : '🌤️'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                      {patterns.chronotype === 'night owl' ? 'Night Owl Pattern Detected' : 
                       patterns.chronotype === 'morning lark' ? 'Morning Lark Pattern Detected' : 
                       'Flexible Sleep Pattern'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {patterns.chronotype === 'night owl' 
                        ? 'Your energy peaks in the evening. Schedule important tasks after 2 PM.'
                        : patterns.chronotype === 'morning lark'
                          ? 'You perform best in the morning. Use 9-11 AM for complex work.'
                          : 'You have flexible peak performance times throughout the day.'}
                    </p>
                  </div>
                </div>

                {patterns.sleepDebt > 5 && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                        Accumulated Sleep Debt
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        You have {patterns.sleepDebt.toFixed(1)} hours of sleep debt. 
                        Add 30 minutes to your sleep schedule for the next week to recover.
                      </p>
                    </div>
                  </div>
                )}

                {patterns.consistency > 70 && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Check className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-200">
                        Great Sleep Consistency!
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Your sleep schedule is {patterns.consistency.toFixed(0)}% consistent. 
                        Keep maintaining this routine for optimal health.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Weekly Summary */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <h3 className="text-lg font-semibold mb-4">📅 This Week's Summary</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-3xl font-bold">{patterns.avgSleep.toFixed(1)}h</div>
                  <div className="text-sm opacity-90">Avg. Sleep</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{'⭐'.repeat(Math.round(patterns.avgQuality))}</div>
                  <div className="text-sm opacity-90">Avg. Quality</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">{Math.round(patterns.efficiency)}%</div>
                  <div className="text-sm opacity-90">Efficiency</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {sleepLogs.filter(log => log.tags?.includes('Exercise')).length}
                  </div>
                  <div className="text-sm opacity-90">Exercise Days</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-sm opacity-90">
                  {patterns.avgSleep >= 7 
                    ? "Great job! You're meeting your sleep goals. 🎉"
                    : patterns.avgSleep >= 6
                      ? "You're close! Just a bit more sleep needed. 💪"
                      : "Focus on getting more sleep this week. 😴"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`flex flex-col items-center gap-1 py-2 px-6 rounded-lg transition-all ${
                currentPage === 'dashboard'
                  ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs font-medium">Home</span>
            </button>
            <button
              onClick={() => setCurrentPage('analytics')}
              className={`flex flex-col items-center gap-1 py-2 px-6 rounded-lg transition-all ${
                currentPage === 'analytics'
                  ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs font-medium">Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}