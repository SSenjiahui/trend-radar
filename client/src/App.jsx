import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from './components/Header.jsx';
import StatsBanner from './components/StatsBanner.jsx';
import GlobalHotlist from './components/GlobalHotlist.jsx';
import PlatformBoard from './components/PlatformBoard.jsx';
import BookmarkDrawer from './components/BookmarkDrawer.jsx';
import TopicDetailModal from './components/TopicDetailModal.jsx';
import { 
  Flame, 
  Layers, 
  Sparkles, 
  Globe, 
  RefreshCw, 
  AlertCircle,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function App() {
  // Application Data States
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdatedText, setLastUpdatedText] = useState('刚刚');

  // Filter & View States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedRegion, setSelectedRegion] = useState('all'); // 'all' | 'domestic' | 'global'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'tabs'
  const [activeTab, setActiveTab] = useState('weibo');
  const [darkMode, setDarkMode] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  // Auto-refresh states
  const [autoRefreshSec, setAutoRefreshSec] = useState(30);
  const [countdown, setCountdown] = useState(30);

  // Bookmarks & Modals
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('trend_radar_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isBookmarkDrawerOpen, setIsBookmarkDrawerOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('trend_radar_bookmarks', JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks:', e);
    }
  }, [bookmarks]);

  // Dark mode class toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  // Fetch all trends from backend
  const fetchTrends = useCallback(async (force = false) => {
    try {
      setIsRefreshing(true);
      setError(null);
      const url = `/api/trends${force ? '?force=true' : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastUpdatedText(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Fetch trends error:', err);
      setError('无法获取实时榜单数据，请检查服务连接');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  // SSE real-time listener
  useEffect(() => {
    let es;
    try {
      es = new EventSource('/api/stream');
      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'update') {
            fetchTrends(false);
          }
        } catch (e) {}
      };
    } catch (e) {
      console.warn('SSE connection failed, falling back to interval:', e);
    }

    return () => {
      if (es) es.close();
    };
  }, [fetchTrends]);

  // Auto-refresh countdown timer
  useEffect(() => {
    if (autoRefreshSec === 0) return;

    setCountdown(autoRefreshSec);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchTrends(true);
          return autoRefreshSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefreshSec, fetchTrends]);

  // Bookmark actions
  const toggleBookmark = (item) => {
    const key = item.id || item.title;
    setBookmarks((prev) => {
      const exists = prev.some((b) => (b.id || b.title) === key);
      if (exists) {
        return prev.filter((b) => (b.id || b.title) !== key);
      } else {
        return [item, ...prev];
      }
    });
  };

  const isBookmarked = (key) => bookmarks.some((b) => (b.id || b.title) === key);

  const platformsObj = data?.platforms || {};
  
  // Filter platform keys by selectedRegion ('all' | 'domestic' | 'global')
  const platformKeys = Object.keys(platformsObj).filter((pKey) => {
    if (selectedRegion === 'all') return true;
    const region = platformsObj[pKey]?.info?.region || 'domestic';
    return region === selectedRegion;
  });

  // Keep activeTab valid when switching regions
  useEffect(() => {
    if (platformKeys.length > 0 && !platformKeys.includes(activeTab)) {
      setActiveTab(platformKeys[0]);
    }
  }, [platformKeys, activeTab]);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white pb-16">
      
      {/* 1. Header with Controls */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isRefreshing={isRefreshing}
        onRefresh={() => fetchTrends(true)}
        autoRefreshSec={autoRefreshSec}
        setAutoRefreshSec={setAutoRefreshSec}
        countdown={countdown}
        viewMode={viewMode}
        setViewMode={setViewMode}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        bookmarkCount={bookmarks.length}
        onOpenBookmarks={() => setIsBookmarkDrawerOpen(true)}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        showTranslation={showTranslation}
        setShowTranslation={setShowTranslation}
      />

      {/* 2. Error Banner if any */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-4 w-full">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button
              onClick={() => fetchTrends(true)}
              className="px-3 py-1 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600"
            >
              重试
            </button>
          </div>
        </div>
      )}

      {/* 3. Stats & Market Overview */}
      <StatsBanner data={data} lastUpdatedText={lastUpdatedText} />

      {/* 4. Global Synthesized Hotlist (Cross-platform Top 15) */}
      {!searchQuery && selectedCategory === '全部' && selectedRegion === 'all' && (
        <GlobalHotlist
          globalRankings={data?.globalRankings || []}
          onSelectTopic={(topic) => setSelectedTopic(topic)}
          onToggleBookmark={toggleBookmark}
          isBookmarked={isBookmarked}
        />
      )}

      {/* 5. Main Multi-Platform Boards */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 mt-8 flex-1 w-full">
        
        {/* View Mode 1: Grid Mode (Multi-column waterfall matrix) */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {platformKeys.map((pKey) => (
              <div key={pKey} className="min-h-[500px]">
                <PlatformBoard
                  platformKey={pKey}
                  platformData={platformsObj[pKey]}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  showTranslation={showTranslation}
                  onToggleBookmark={toggleBookmark}
                  isBookmarked={isBookmarked}
                  onSelectTopic={(topic) => setSelectedTopic(topic)}
                />
              </div>
            ))}
          </div>
        )}

        {/* View Mode 2: Tabs Mode (Focused single platform tab) */}
        {viewMode === 'tabs' && (
          <div className="flex flex-col gap-5">
            {/* Tab navigation pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {platformKeys.map((pKey) => {
                const info = platformsObj[pKey]?.info || {};
                const isActive = activeTab === pKey;
                return (
                  <button
                    key={pKey}
                    onClick={() => setActiveTab(pKey)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40'
                        : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
                    }`}
                  >
                    <span>{info.name || pKey}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {platformsObj[pKey]?.items?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Platform Board in full width */}
            <div className="w-full max-w-4xl mx-auto">
              <PlatformBoard
                platformKey={activeTab}
                platformData={platformsObj[activeTab]}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                showTranslation={showTranslation}
                onToggleBookmark={toggleBookmark}
                isBookmarked={isBookmarked}
                onSelectTopic={(topic) => setSelectedTopic(topic)}
              />
            </div>
          </div>
        )}

      </main>

      {/* 6. Footer */}
      <footer className="max-w-7xl mx-auto px-4 lg:px-8 mt-16 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Flame className="w-4 h-4 text-indigo-400" />
          <span className="font-semibold text-slate-400">全网热点雷达 · TrendRadar</span>
        </div>
        <p>聚合国内主流社交（微博/知乎/抖音/B站/百度/头条）与国际极客大盘（X/Reddit/HackerNews/YouTube/ProductHunt/GitHub）· 支持智能中文翻译</p>
      </footer>

      {/* 7. Drawers & Modals */}
      <BookmarkDrawer
        isOpen={isBookmarkDrawerOpen}
        onClose={() => setIsBookmarkDrawerOpen(false)}
        bookmarks={bookmarks}
        onRemoveBookmark={(id) => toggleBookmark({ id })}
        onClearAll={() => setBookmarks([])}
        onSelectTopic={(topic) => {
          setSelectedTopic(topic);
          setIsBookmarkDrawerOpen(false);
        }}
      />

      <TopicDetailModal
        topic={selectedTopic}
        onClose={() => setSelectedTopic(null)}
        onToggleBookmark={toggleBookmark}
        isBookmarked={isBookmarked}
      />

    </div>
  );
}
