import React, { useState, useEffect } from 'react';
import { ShieldCheck, Play, RefreshCw, Clock, Radio, Cpu } from 'lucide-react';

export default function Topbar({ onTriggerDemo, onSimulate, aiMode = 'LOCAL AI (Active)', isAnalyzing = false }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0a0d14] border-b border-[#1e293b] px-6 flex items-center justify-between shrink-0 select-none">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-sm font-black font-mono tracking-wider text-slate-100 uppercase flex items-center gap-2">
            CYBERNEXUS AI
            <span className="text-slate-500 font-normal">|</span>
            <span className="text-xs text-blue-400 font-semibold lowercase">
              "from scattered events to explainable threat intelligence"
            </span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono tracking-tight hidden sm:block">
            AI-POWERED DETECTION, CORRELATION AND PRIORITIZATION FOR DIGITAL RESILIENCE
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* UTC Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded bg-[#0f1422] border border-[#1e293b] text-xs font-mono text-cyan-400">
          <Clock className="w-3.5 h-3.5" />
          <span>{time}</span>
        </div>

        {/* AI Mode Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/40 border border-blue-800/40 text-xs font-mono text-blue-300">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          <span>{aiMode}</span>
        </div>

        {/* Operational Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>● SOC SYSTEM OPERATIONAL</span>
        </div>

        {/* Simulate Threat Button */}
        <button
          onClick={onSimulate}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white rounded text-xs font-mono font-bold shadow-[0_0_12px_rgba(239,68,68,0.3)] transition-all disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>SIMULATE ATTACK</span>
        </button>

        {/* One-Click Demo Reset/Run */}
        <button
          onClick={onTriggerDemo}
          disabled={isAnalyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-mono font-bold shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          <span>RESET / DEMO</span>
        </button>
      </div>
    </header>
  );
}
