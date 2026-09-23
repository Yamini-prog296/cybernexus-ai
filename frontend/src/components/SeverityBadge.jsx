import React from 'react';

export default function SeverityBadge({ severity }) {
  const sev = (severity || 'LOW').toUpperCase();

  const styles = {
    CRITICAL: 'bg-red-950/70 text-red-400 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
    HIGH: 'bg-orange-950/70 text-orange-400 border-orange-500/50',
    MEDIUM: 'bg-amber-950/70 text-amber-400 border-amber-500/50',
    LOW: 'bg-emerald-950/70 text-emerald-400 border-emerald-500/50',
    INFO: 'bg-cyan-950/70 text-cyan-400 border-cyan-500/50'
  };

  const currentStyle = styles[sev] || styles.LOW;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold font-mono tracking-wider border ${currentStyle}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {sev}
    </span>
  );
}
