import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }) {
  const colorMap = {
    red: 'border-red-500/30 text-red-400 bg-red-950/20',
    orange: 'border-orange-500/30 text-orange-400 bg-orange-950/20',
    amber: 'border-amber-500/30 text-amber-400 bg-amber-950/20',
    emerald: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/20',
    blue: 'border-blue-500/30 text-blue-400 bg-blue-950/20',
    cyan: 'border-cyan-500/30 text-cyan-400 bg-cyan-950/20',
    indigo: 'border-indigo-500/30 text-indigo-400 bg-indigo-950/20'
  };

  const badgeStyle = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${badgeStyle}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold font-mono text-slate-100">{value}</span>
        {trend && (
          <span className="text-[11px] font-mono text-slate-400">{trend}</span>
        )}
      </div>

      {subtitle && (
        <span className="mt-1 text-xs text-slate-500 font-sans">{subtitle}</span>
      )}
    </div>
  );
}
