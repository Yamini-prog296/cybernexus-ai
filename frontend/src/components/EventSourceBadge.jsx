import React from 'react';
import { 
  KeyRound, 
  Network, 
  Laptop, 
  AppWindow, 
  Database, 
  ShieldAlert, 
  Cloud 
} from 'lucide-react';

export default function EventSourceBadge({ source }) {
  const src = (source || 'AUTHENTICATION').toUpperCase();

  const config = {
    AUTHENTICATION: { icon: KeyRound, color: 'text-violet-400 bg-violet-950/40 border-violet-800/40' },
    NETWORK: { icon: Network, color: 'text-sky-400 bg-sky-950/40 border-sky-800/40' },
    ENDPOINT: { icon: Laptop, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40' },
    APPLICATION: { icon: AppWindow, color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
    DATABASE: { icon: Database, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40' },
    FIREWALL: { icon: ShieldAlert, color: 'text-rose-400 bg-rose-950/40 border-rose-800/40' },
    CLOUD: { icon: Cloud, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' }
  };

  const item = config[src] || { icon: ShieldAlert, color: 'text-slate-400 bg-slate-800/40 border-slate-700/40' };
  const Icon = item.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${item.color}`}>
      <Icon className="w-3 h-3" />
      {src}
    </span>
  );
}
