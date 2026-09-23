import React from 'react';
import { ShieldAlert, ArrowRight, User, Laptop, Database, Clock } from 'lucide-react';
import SeverityBadge from './SeverityBadge';
import RiskScore from './RiskScore';

export default function IncidentTable({ incidents = [], onSelectIncident, loading = false }) {
  if (loading) {
    return (
      <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-8 text-center text-slate-400 font-mono text-xs">
        <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <div>Prioritizing and ranking threat incidents...</div>
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-8 text-center text-slate-500 font-mono text-sm">
        No active incidents detected. All system telemetry within operational bounds.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = (status || 'NEW').toUpperCase();
    const map = {
      NEW: 'bg-blue-950/60 text-blue-400 border-blue-800/40',
      ACKNOWLEDGED: 'bg-purple-950/60 text-purple-400 border-purple-800/40',
      INVESTIGATING: 'bg-amber-950/60 text-amber-400 border-amber-800/40',
      RESOLVED: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${map[s] || map.NEW}`}>
        {s}
      </span>
    );
  };

  return (
    <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-[#131b2e] border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">Priority / Risk</th>
              <th className="py-3 px-3">Incident ID & Title</th>
              <th className="py-3 px-3">Attack Pattern</th>
              <th className="py-3 px-3">Affected Entities</th>
              <th className="py-3 px-3">Events</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {incidents.map((inc, idx) => (
              <tr
                key={inc.id}
                onClick={() => onSelectIncident && onSelectIncident(inc.id)}
                className="hover:bg-[#131b2e]/80 transition-colors cursor-pointer group"
              >
                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-bold w-4 text-center">#{idx + 1}</span>
                    <RiskScore score={inc.risk_score} showLabel={false} />
                    <SeverityBadge severity={inc.severity} />
                  </div>
                </td>

                <td className="py-3 px-3 max-w-[280px]">
                  <div className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                    {inc.title}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="text-cyan-400 font-semibold">{inc.id}</span>
                    <span>•</span>
                    <span>Conf: {Math.round(inc.confidence)}%</span>
                  </div>
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 text-[11px]">
                    {inc.attack_pattern}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    {inc.affected_users && inc.affected_users.length > 0 && (
                      <span className="flex items-center gap-1 text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        <User className="w-3 h-3 text-blue-400" />
                        {inc.affected_users.join(', ')}
                      </span>
                    )}
                    {inc.affected_resources && inc.affected_resources.length > 0 && (
                      <span className="flex items-center gap-1 text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 truncate max-w-[140px]">
                        <Database className="w-3 h-3 text-rose-400" />
                        {inc.affected_resources[0]}
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                  <span className="font-bold text-slate-100">{inc.event_count}</span> logs
                </td>

                <td className="py-3 px-3 whitespace-nowrap">
                  {getStatusBadge(inc.status)}
                </td>

                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectIncident) onSelectIncident(inc.id);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/40 text-xs transition-all font-mono"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
