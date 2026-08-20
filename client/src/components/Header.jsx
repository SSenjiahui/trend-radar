import React from 'react';
import { 
  Flame, 
  RefreshCw, 
  Search, 
  Bookmark, 
  Sun, 
  Moon, 
  LayoutGrid, 
  Columns3, 
  Radio,
  SlidersHorizontal,
  Languages
} from 'lucide-react';

export default function Header({
  searchQuery,
  setSearchQuery,
  isRefreshing,
  onRefresh,
  autoRefreshSec,
  setAutoRefreshSec,
  countdown,
  viewMode,
  setViewMode,
  darkMode,
  setDarkMode,
  bookmarkCount,
  onOpenBookmarks,
  selectedCategory,
  setSelectedCategory,
  selectedRegion,
  setSelectedRegion,
  showTranslation,
  setShowTranslation
}) {
  const categories = ['全部', '综合', '科技', '娱乐', '生活', '财经'];
  const regions = [
    { id: 'all', label: '🌐 全网大盘' },
    { id: 'domestic', label: '🇨🇳 国内热榜' },
    { id: 'global', label: '🌍 国际海外' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-700/40 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Logo & Brand */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/25">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  全网热点雷达
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE 实时
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                国内与国际主流社交平台热度实时聚合 · 支持智能中文翻译
              </p>
            </div>
          </div>

          {/* Mobile Right Action Buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className={`p-2 rounded-lg border text-xs font-semibold ${
                showTranslation ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="切换翻译"
            >
              译
            </button>
            <button
              onClick={onOpenBookmarks}
              className="relative p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700"
            >
              <Bookmark className="w-4 h-4" />
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {bookmarkCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onRefresh(true)}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-indigo-600 text-white"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-72 lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索话题、中英文关键词..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Control Bar & Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          
          {/* Translation Global Toggle */}
          <button
            onClick={() => setShowTranslation(!showTranslation)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showTranslation
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-700/60'
            }`}
            title="切换海外内容自动中文翻译"
          >
            <Languages className="w-3.5 h-3.5" />
            <span>{showTranslation ? '已译中文' : '英文原版'}</span>
          </button>

          {/* Auto Refresh Selector & Countdown */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300">
            <Radio className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={autoRefreshSec}
              onChange={(e) => setAutoRefreshSec(Number(e.target.value))}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value={15} className="bg-slate-900 text-slate-200">15s 刷新</option>
              <option value={30} className="bg-slate-900 text-slate-200">30s 刷新</option>
              <option value={60} className="bg-slate-900 text-slate-200">60s 刷新</option>
              <option value={0} className="bg-slate-900 text-slate-200">暂停自动</option>
            </select>
            {autoRefreshSec > 0 && (
              <span className="font-mono text-indigo-400 font-medium">
                {countdown}s
              </span>
            )}
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={() => onRefresh(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '同步中' : '刷新'}
          </button>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900/60 border border-slate-700/60">
            <button
              onClick={() => setViewMode('grid')}
              title="多列聚合视图"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('tabs')}
              title="平台专区视图"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'tabs' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {/* Bookmarks Drawer Trigger */}
          <button
            onClick={onOpenBookmarks}
            className="relative p-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-indigo-300 transition-all"
            title="我的收藏热点"
          >
            <Bookmark className="w-4 h-4" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-indigo-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold ring-2 ring-slate-900">
                {bookmarkCount}
              </span>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-yellow-400 transition-all"
            title={darkMode ? '切换浅色模式' : '切换深色模式'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Region & Category Filter Bar */}
      <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Region Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {regions.map((reg) => (
            <button
              key={reg.id}
              onClick={() => setSelectedRegion(reg.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                selectedRegion === reg.id
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/40'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 text-xs text-slate-400 mr-1 flex-shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>分类:</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>
    </header>
  );
}
