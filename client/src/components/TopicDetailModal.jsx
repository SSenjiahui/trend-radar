import React from 'react';
import { X, ExternalLink, Flame, Bookmark, Share2, Globe, MessageSquare, Languages } from 'lucide-react';

export default function TopicDetailModal({
  topic,
  onClose,
  onToggleBookmark,
  isBookmarked
}) {
  if (!topic) return null;

  const bookmarked = isBookmarked(topic.id || topic.title);
  const hasTranslation = Boolean(topic.titleZh && topic.titleZh !== topic.title);

  const copyToClipboard = () => {
    const text = `${topic.titleZh || topic.title} - ${topic.url || window.location.href}`;
    navigator.clipboard?.writeText(text);
    alert('已成功复制热搜话题与链接到剪贴板！');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold text-xs border border-indigo-500/30">
              {topic.platform ? `${topic.platform.toUpperCase()} 热点` : '全网焦点'}
            </span>
            {topic.region === 'global' && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30 flex items-center gap-1">
                <Languages className="w-3 h-3" />
                全球热点 (含智能中文翻译)
              </span>
            )}
            {topic.category && (
              <span className="text-xs text-slate-400">
                #{topic.category}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleBookmark(topic)}
              className={`p-2 rounded-xl border transition-all ${
                bookmarked
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={bookmarked ? '已收藏' : '收藏'}
            >
              <Bookmark className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={copyToClipboard}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 hover:text-white transition-all"
              title="分享复制"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 border border-slate-700 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title Area */}
        <div>
          <h2 className="text-lg md:text-xl font-bold text-slate-100 leading-snug">
            {topic.titleZh || topic.title}
          </h2>

          {/* Original English Title if translated */}
          {hasTranslation && (
            <div className="mt-1.5 text-xs text-slate-400 font-mono bg-slate-800/40 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-500 font-semibold mr-1">EN 原文:</span>
              <span>{topic.title}</span>
            </div>
          )}
        </div>

        {/* Description or Excerpt */}
        {(topic.desc || topic.descZh) && (
          <div className="mt-3 p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-xs md:text-sm text-slate-300 leading-relaxed">
            <p>{topic.descZh || topic.desc}</p>
            {topic.descZh && topic.desc !== topic.descZh && (
              <p className="text-xs text-slate-500 mt-1 font-mono">{topic.desc}</p>
            )}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 rounded-2xl bg-slate-800/30 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500">热度指标</div>
              <div className="text-sm font-bold text-slate-200 font-mono">
                {topic.hotFormatted || `${topic.hotScore || 0}`}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/30 border border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500">当前排名</div>
              <div className="text-sm font-bold text-slate-200">
                第 {topic.rank || 1} 位
              </div>
            </div>
          </div>
        </div>

        {/* Related cross-platform links if global topic */}
        {topic.relatedLinks && topic.relatedLinks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 font-semibold mb-2">
              各大平台原帖直达：
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
              {topic.relatedLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-xs text-slate-300 hover:text-indigo-300 transition-all border border-slate-700/30"
                >
                  <span className="font-medium capitalize">{link.platform} 榜单 #{link.rank}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        {topic.url && (
          <div className="mt-6">
            <a
              href={topic.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
            >
              <span>前往原平台查看完整讨论</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

      </div>
    </div>
  );
}
