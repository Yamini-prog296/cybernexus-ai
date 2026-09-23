import React from 'react';

export default function RiskScore({ score, size = 'md', showLabel = true }) {
  const numScore = Math.round(Number(score) || 0);

  let colorClass = 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40';
  let badgeBg = 'bg-emerald-500';
  let label = 'LOW';

  if (numScore >= 76) {
    colorClass = 'text-red-400 bg-red-950/40 border-red-500/50';
    badgeBg = 'bg-red-500';
    label = 'CRITICAL';
  } else if (numScore >= 51) {
    colorClass = 'text-orange-400 bg-orange-950/40 border-orange-500/50';
    badgeBg = 'bg-orange-500';
    label = 'HIGH';
  } else if (numScore >= 26) {
    colorClass = 'text-amber-400 bg-amber-950/40 border-amber-500/50';
    badgeBg = 'bg-amber-500';
    label = 'MEDIUM';
  }

  if (size === 'lg') {
    return (
      <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border ${colorClass}`}>
        <div className="text-3xl font-black font-mono tracking-tight">{numScore}</div>
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">RISK SCORE</span>
          <span className="text-xs font-bold tracking-wider">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono border ${colorClass}`}>
      <span className="font-bold text-sm">{numScore}</span>
      <span className="text-slate-400 text-xs">/100</span>
      {showLabel && (
        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded text-slate-950 ${badgeBg} ml-1`}>
          {label}
        </span>
      )}
    </div>
  );
}
