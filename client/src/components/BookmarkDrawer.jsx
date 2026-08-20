import React from 'react';
import { Bookmark, X, ExternalLink, Trash2, Flame } from 'lucide-react';

export default function BookmarkDrawer({
  isOpen,
  onClose,
  bookmarks = [],
  onRemoveBookmark,
  onClearAll,
  onSelectTopic
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-slate-100 text-base">我的收藏热点</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
              {bookmarks.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {bookmarks.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-500/10 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                清空
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
          {bookmarks.length === 0 ? (
            <div className="py-24 text-center text-slate-500 text-sm">
              <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>暂无收藏的热门话题</p>
              <p className="text-xs text-slate-600 mt-1">点击任意话题旁的星标/书签即可保存</p>
            </div>
          ) : (
            bookmarks.map((item) => (
              <div
                key={item.id || item.title}
                onClick={() => onSelectTopic(item)}
                className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 cursor-pointer group transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 line-clamp-2">
                    {item.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(item.id || item.title);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="移除"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/40 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-amber-400 font-mono">
                    <Flame className="w-3 h-3" />
                    {item.hotFormatted || '热度'}
                  </span>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-0.5 text-indigo-400 hover:underline"
                  >
                    <span>原帖</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
