import React, { useState } from 'react';
import { 
  Flame, 
  ExternalLink, 
  Bookmark, 
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Eye,
  Tv,
  Share2,
  ThumbsUp,
  ArrowUp,
  Languages
} from 'lucide-react';

export default function PlatformBoard({
  platformKey,
  platformData,
  searchQuery = '',
  selectedCategory = '全部',
  showTranslation = true,
  onToggleBookmark,
  isBookmarked,
  onSelectTopic
}) {
  const { info = {}, items = [], updatedAt } = platformData || {};
  const [toggledItems, setToggledItems] = useState({});

  const toggleItemTranslation = (itemId, e) => {
    e.stopPropagation();
    setToggledItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Filter items by search query and category
  const filteredItems = items.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(q) ||
      (item.titleZh && item.titleZh.toLowerCase().includes(q)) ||
      (item.desc && item.desc.toLowerCase().includes(q)) ||
      (item.descZh && item.descZh.toLowerCase().includes(q));

    const matchesCategory = selectedCategory === '全部' || 
      (item.category && item.category.toLowerCase().includes(selectedCategory.toLowerCase())) ||
      (info.category && info.category.toLowerCase().includes(selectedCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

  // Calculate max hot score for relative progress bar
  const maxHot = items.length > 0 ? Math.max(...items.map(it => it.hotScore || 1)) : 1;

  // Platform brand icon / color styling
  const platformColorMap = {
    weibo: { bg: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/20', flag: '🇨🇳' },
    zhihu: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/20', flag: '🇨🇳' },
    douyin: { bg: 'bg-pink-500', text: 'text-pink-400', border: 'border-pink-500/20', flag: '🇨🇳' },
    bilibili: { bg: 'bg-sky-400', text: 'text-sky-400', border: 'border-sky-500/20', flag: '🇨🇳' },
    baidu: { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/20', flag: '🇨🇳' },
    toutiao: { bg: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/20', flag: '🇨🇳' },
    juejin: { bg: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-600/20', flag: '🇨🇳' },

    x: { bg: 'bg-slate-100 text-slate-950', text: 'text-slate-200', border: 'border-slate-400/20', flag: '🌍' },
    reddit: { bg: 'bg-orange-600', text: 'text-orange-400', border: 'border-orange-500/20', flag: '🌍' },
    hackernews: { bg: 'bg-amber-600', text: 'text-amber-400', border: 'border-amber-500/20', flag: '🌍' },
    youtube: { bg: 'bg-red-600', text: 'text-red-500', border: 'border-red-600/20', flag: '🌍' },
    producthunt: { bg: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/20', flag: '🌍' },
    github: { bg: 'bg-slate-300 text-slate-900', text: 'text-slate-200', border: 'border-slate-500/20', flag: '🌍' }
  };

  const style = platformColorMap[platformKey] || { bg: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/20', flag: '🌐' };
  const isGlobal = info.region === 'global' || info.region === 'international';

  return (
    <div className="glass-panel rounded-2xl border border-slate-800 flex flex-col h-full shadow-lg transition-all duration-200 hover:border-slate-700/80">
      
      {/* Platform Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full ${style.bg} shadow-sm`} />
          <h3 className="font-bold text-slate-100 text-base flex items-center gap-1.5">
            <span>{info.name || platformKey}</span>
            <span className="text-xs">{style.flag}</span>
          </h3>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
            {info.category || '热点'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-mono bg-slate-900/60 px-2 py-0.5 rounded-full border border-slate-800">
            {filteredItems.length} 条
          </span>
        </div>
      </div>

      {/* Topics List */}
      <div className="p-2 space-y-1.5 flex-1 overflow-y-auto max-h-[580px] custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            {searchQuery ? '没有找到匹配的话题' : '暂无数据或正在同步中...'}
          </div>
        ) : (
          filteredItems.map((item, idx) => {
            const isTop3 = idx < 3;
            const bookmarked = isBookmarked(item.id || item.title);
            const percent = Math.min(Math.max(((item.hotScore || 1) / maxHot) * 100, 8), 100);

            // Determine whether to display Chinese translation or Original
            const hasTranslation = Boolean(item.titleZh && item.titleZh !== item.title);
            const isCardToggled = toggledItems[item.id];
            const displayChinese = hasTranslation && (showTranslation ? !isCardToggled : isCardToggled);

            const displayTitle = displayChinese ? item.titleZh : item.title;
            const secondaryTitle = (hasTranslation && displayChinese) ? item.title : (hasTranslation && !displayChinese ? item.titleZh : null);
            const displayDesc = displayChinese && item.descZh ? item.descZh : item.desc;

            return (
              <div
                key={item.id || idx}
                onClick={() => onSelectTopic({ ...item, displayTitle, displayDesc, displayChinese })}
                className="group relative p-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-800/70 border border-slate-800/50 hover:border-slate-700/80 transition-all duration-150 cursor-pointer flex flex-col gap-1.5"
              >
                {/* Background Heat Progress Bar */}
                <div 
                  className="absolute left-0 bottom-0 top-0 rounded-xl bg-indigo-500/[0.04] group-hover:bg-indigo-500/[0.08] transition-all -z-0 pointer-events-none"
                  style={{ width: `${percent}%` }}
                />

                <div className="flex items-start justify-between gap-2 relative z-10">
                  {/* Rank + Title */}
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <span className={`w-5 h-5 rounded-md text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      idx === 0 ? 'bg-amber-500 text-slate-950 shadow-sm' :
                      idx === 1 ? 'bg-slate-300 text-slate-900' :
                      idx === 2 ? 'bg-amber-700 text-amber-100' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {item.rank || idx + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 line-clamp-2 transition-colors leading-relaxed">
                          {displayTitle}
                        </span>

                        {/* Tag Badge */}
                        {item.tag && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold flex-shrink-0 ${
                            item.tagType === 'danger' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            item.tagType === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            item.tagType === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            item.tagType === 'info' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                            'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {item.tag}
                          </span>
                        )}
                      </div>

                      {/* Secondary English original subtitle if translated */}
                      {secondaryTitle && (
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 font-mono">
                          {secondaryTitle}
                        </p>
                      )}

                      {/* Snippet / Desc if present */}
                      {displayDesc && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {displayDesc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions: Translate, Bookmark & External link */}
                  <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                    {/* Per-card Translation Toggle */}
                    {hasTranslation && (
                      <button
                        onClick={(e) => toggleItemTranslation(item.id, e)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                          displayChinese 
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' 
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                        title={displayChinese ? '查看英文原文' : '查看中文翻译'}
                      >
                        译
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(item);
                      }}
                      className={`p-1 rounded-md transition-all ${
                        bookmarked 
                          ? 'text-indigo-400 bg-indigo-500/10' 
                          : 'text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100'
                      }`}
                      title={bookmarked ? '取消收藏' : '收藏'}
                    >
                      <Bookmark className="w-3 h-3" fill={bookmarked ? 'currentColor' : 'none'} />
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-md text-slate-500 hover:text-indigo-300 transition-colors opacity-0 group-hover:opacity-100"
                      title="在新窗口打开原帖"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Footer metrics */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 relative z-10 pl-7">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <Flame className={`w-3 h-3 ${isTop3 ? 'text-amber-400' : 'text-slate-500'}`} />
                      {item.hotFormatted}
                    </span>

                    {item.metrics?.comments > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                        <MessageSquare className="w-2.5 h-2.5" />
                        {item.metrics.comments}
                      </span>
                    )}

                    {item.metrics?.upvotes > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                        <ArrowUp className="w-2.5 h-2.5" />
                        {item.metrics.upvotes}
                      </span>
                    )}

                    {item.metrics?.danmaku > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                        <Tv className="w-2.5 h-2.5" />
                        {item.metrics.danmaku}
                      </span>
                    )}
                  </div>

                  {item.category && item.category !== '热点' && (
                    <span className="text-[10px] text-slate-500">
                      #{item.category}
                    </span>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
