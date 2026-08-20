import React from 'react';
import { Flame, ExternalLink, Bookmark, Sparkles, Share2 } from 'lucide-react';

export default function GlobalHotlist({ 
  globalRankings = [], 
  onSelectTopic, 
  onToggleBookmark, 
  isBookmarked 
}) {
  if (!globalRankings || globalRankings.length === 0) return null;

  const platformBadgeMap = {
    weibo: { name: '微博', bg: 'bg-red-500/20 text-red-400 border-red-500/30' },
    zhihu: { name: '知乎', bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    douyin: { name: '抖音', bg: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    bilibili: { name: 'B站', bg: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
    baidu: { name: '百度', bg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    toutiao: { name: '头条', bg: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    juejin: { name: '掘金', bg: 'bg-blue-600/20 text-blue-300 border-blue-600/30' },
    x: { name: 'X', bg: 'bg-slate-300/20 text-slate-200 border-slate-400/30' },
    reddit: { name: 'Reddit', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    hackernews: { name: 'HN', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    youtube: { name: 'YouTube', bg: 'bg-red-600/20 text-red-400 border-red-600/30' },
    producthunt: { name: 'PH', bg: 'bg-amber-600/20 text-amber-300 border-amber-600/30' },
    github: { name: 'GitHub', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-6">
      <div className="glass-panel rounded-3xl p-5 lg:p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-1/4 w-96 h-24 bg-gradient-to-r from-indigo-500/10 via-pink-500/10 to-amber-500/10 blur-3xl -z-10" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 text-white shadow-md shadow-amber-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">全网超级热度风云榜</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-300 font-semibold border border-amber-500/30">
                  TOP 15 焦点
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                基于多平台重合度与全网讨论热度算法综合加权计算
              </p>
            </div>
          </div>
        </div>

        {/* Mega Grid of Global Trends */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {globalRankings.map((item, idx) => {
            const isTop3 = idx < 3;
            const bookmarked = isBookmarked(item.id || item.title);

            return (
              <div
                key={item.id || idx}
                onClick={() => onSelectTopic(item)}
                className={`group relative p-4 rounded-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between border ${
                  isTop3 
                    ? 'bg-gradient-to-b from-slate-800/80 to-slate-900/90 border-amber-500/30 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10' 
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div>
                  {/* Top bar with rank & platforms */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                        idx === 0 ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' :
                        idx === 1 ? 'bg-slate-300 text-slate-900 shadow-sm' :
                        idx === 2 ? 'bg-amber-700 text-amber-100 shadow-sm' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>

                      {/* Platforms Badge Icons */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {item.platforms.map((pKey) => {
                          const badge = platformBadgeMap[pKey] || { name: pKey, bg: 'bg-slate-800 text-slate-300' };
                          return (
                            <span
                              key={pKey}
                              className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${badge.bg}`}
                            >
                              {badge.name}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bookmark Action */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(item);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        bookmarked 
                          ? 'text-indigo-400 bg-indigo-500/10' 
                          : 'text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100'
                      }`}
                      title={bookmarked ? '已收藏' : '收藏此热点'}
                    >
                      <Bookmark className="w-3.5 h-3.5" fill={bookmarked ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 line-clamp-2 leading-relaxed transition-colors">
                    {item.title}
                  </h3>
                </div>

                {/* Footer with Hot Score */}
                <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Flame className={`w-3.5 h-3.5 ${isTop3 ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
                    <span className="font-semibold text-slate-300 font-mono">
                      {item.hotFormatted}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-indigo-400 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span>查看详情</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
