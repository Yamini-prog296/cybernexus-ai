import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  ListFilter, 
  BarChart3, 
  PlayCircle, 
  Terminal, 
  ShieldCheck,
  Radio,
  Cpu
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, activeIncidentsCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'SOC Dashboard', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incident Queue', icon: ShieldAlert, badge: activeIncidentsCount },
    { id: 'events', label: 'Security Events', icon: ListFilter },
    { id: 'analytics', label: 'Security Analytics', icon: BarChart3 },
    { id: 'demo', label: 'Hero Demo Mode', icon: PlayCircle, highlight: true },
  ];

  return (
    <aside className="w-64 bg-[#0a0d14] border-r border-[#1e293b] flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-[#1e293b]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-mono font-black text-sm tracking-wider text-slate-100 flex items-center gap-1.5">
              CYBERNEXUS<span className="text-blue-500">AI</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono tracking-tight">DEFENSIVE SOC PLATFORM</div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            COMMAND & CONTROL
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#131b2e]/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-red-500 text-slate-950' : 'bg-red-950/80 text-red-400 border border-red-800/50'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {item.highlight && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500 text-slate-950 animate-pulse">
                    LIVE
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-[#1e293b] bg-[#070a10]">
        <div className="p-2.5 rounded-lg bg-[#0f1422] border border-[#1e293b] text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>Intellect Hack 2026</span>
          </div>
          <div className="text-[10px] text-slate-500">
            SEC IEEE Reliability Society SBC Problem Statement 5
          </div>
        </div>
      </div>
    </aside>
  );
}
