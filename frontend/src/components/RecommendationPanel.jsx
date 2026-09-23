import React, { useState } from 'react';
import { ShieldCheck, CheckSquare, Square, Copy, Check, AlertOctagon } from 'lucide-react';

export default function RecommendationPanel({ recommendations = [], attackPattern }) {
  const [checkedItems, setCheckedItems] = useState({});
  const [copied, setCopied] = useState(false);

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const copyToClipboard = () => {
    const text = recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allCount = recommendations.length;
  const completedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold font-mono tracking-wide text-slate-100 uppercase">
              RECOMMENDED DEFENSIVE ACTIONS (SOP)
            </h3>
            <p className="text-xs text-slate-400">
              Standard Incident Response containment and mitigation checklist
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            {completedCount}/{allCount} Completed
          </span>
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
            title="Copy SOP to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy SOP'}
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {recommendations.map((action, idx) => {
          const isDone = !!checkedItems[idx];
          return (
            <div
              key={idx}
              onClick={() => toggleCheck(idx)}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                isDone 
                  ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400 line-through' 
                  : 'bg-[#131b2e]/60 border-slate-800/80 hover:border-slate-700 text-slate-200'
              }`}
            >
              <button className="mt-0.5 text-slate-400 hover:text-slate-200 focus:outline-none">
                {isDone ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
              </button>
              <div className="flex-1 text-xs font-mono leading-relaxed">
                <span className="font-bold text-slate-400 mr-2">[{idx + 1}]</span>
                {action}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-amber-950/20 border border-amber-800/30 rounded-lg flex items-center gap-2.5 text-xs font-mono text-amber-300">
        <AlertOctagon className="w-4 h-4 shrink-0 text-amber-400" />
        <span>Strictly defensive measures: execute isolation and credential resets in accordance with organizational authorization policies.</span>
      </div>
    </div>
  );
}
