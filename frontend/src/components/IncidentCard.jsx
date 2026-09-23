import React from 'react';
import { ArrowRight, User, Database, Clock, ShieldAlert } from 'lucide-react';
import SeverityBadge from './SeverityBadge';
import RiskScore from './RiskScore';

export default function IncidentCard({ incident, onSelect }) {
  if (!incident) return null;

  return (
    <div
      onClick={() => onSelect && onSelect(incident.id)}
      className="bg-[#0f1422] border border-[#1e293b] hover:border-slate-700 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:-translate-y-0.5 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <RiskScore score={incident.risk_score} />
          <SeverityBadge severity={incident.severity} />
        </div>

        <h4 className="text-sm font-bold font-mono text-slate-100 hover:text-blue-400 transition-colors line-clamp-2">
          {incident.title}
        </h4>

        <div className="mt-2 text-xs font-mono text-cyan-400 font-semibold">
          {incident.attack_pattern}
        </div>

        <p className="mt-2 text-xs text-slate-400 font-sans line-clamp-2">
          {incident.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          {incident.affected_users && incident.affected_users[0] && (
            <span className="flex items-center gap-1 text-slate-300">
              <User className="w-3 h-3 text-blue-400" />
              {incident.affected_users[0]}
            </span>
          )}
          <span>•</span>
          <span>{incident.event_count} logs</span>
        </div>

        <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold">
          <span>View</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
