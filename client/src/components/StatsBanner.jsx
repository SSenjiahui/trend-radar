import React from 'react';
import { Activity, TrendingUp, Radio, Globe, Layers } from 'lucide-react';

export default function StatsBanner({ data, lastUpdatedText }) {
  const totalItems = data?.totalItems || 0;
  const totalPlatforms = data?.totalPlatforms || 8;
  const topGlobal = data?.globalRankings?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 mt-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Stat 1: Total Realtime Topics */}
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3.5 border border-slate-800/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">全网实时监控话题</div>
            <div className="text-xl font-bold text-slate-100 flex items-baseline gap-1">
              <span>{totalItems}</span>
              <span className="text-xs font-normal text-slate-400">条</span>
            </div>
          </div>
        </div>

        {/* Stat 2: Active Platforms */}
        <div className="glass-panel p-4 rounded-2xl flex items-center gap-3.5 border border-slate-800/80 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">覆盖核心社交大盘</div>
            <div className="text-xl font-bold text-slate-100 flex items-baseline gap-1">
              <span>{totalPlatforms}</span>
              <span className="text-xs font-normal text-slate-400">大平台</span>
            </div>
          </div>
        </div>

        {/* Stat 3: #1 Super Hot Topic */}
        <div className="glass-panel p-4 rounded-2xl col-span-2 lg:col-span-2 flex items-center justify-between border border-slate-800/80 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">全网超级热搜 NO.1</span>
                {topGlobal?.platformCount > 1 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-medium">
                    {topGlobal.platformCount} 平台霸榜
                  </span>
                )}
              </div>
              <div className="text-sm font-semibold text-slate-100 truncate">
                {topGlobal ? topGlobal.title : '正在监测全网最新热点...'}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end pl-3 flex-shrink-0 border-l border-slate-800">
            <span className="text-[10px] text-slate-500">最后同步时间</span>
            <span className="text-xs text-slate-300 font-mono">{lastUpdatedText || '刚刚'}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
