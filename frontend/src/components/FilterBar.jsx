import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export default function FilterBar({ filters, onFilterChange, onReset }) {
  const sources = ['', 'AUTHENTICATION', 'NETWORK', 'ENDPOINT', 'APPLICATION', 'DATABASE', 'FIREWALL', 'CLOUD'];
  const severities = ['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const users = ['', 'alex', 'maya', 'sam', 'arun', 'dev_user'];

  return (
    <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-3 flex flex-wrap items-center gap-3 text-xs font-mono">
      <div className="flex items-center gap-1.5 text-slate-400 font-semibold shrink-0">
        <Filter className="w-3.5 h-3.5 text-blue-400" />
        <span>FILTERS:</span>
      </div>

      {/* Source Type Filter */}
      <div className="flex items-center gap-1.5">
        <label className="text-slate-400">Source:</label>
        <select
          value={filters.source_type || ''}
          onChange={(e) => onFilterChange('source_type', e.target.value)}
          className="bg-[#131b2e] border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Sources</option>
          {sources.filter(Boolean).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Severity Filter */}
      <div className="flex items-center gap-1.5">
        <label className="text-slate-400">Severity:</label>
        <select
          value={filters.severity || ''}
          onChange={(e) => onFilterChange('severity', e.target.value)}
          className="bg-[#131b2e] border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Severities</option>
          {severities.filter(Boolean).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* User Filter */}
      <div className="flex items-center gap-1.5">
        <label className="text-slate-400">User:</label>
        <select
          value={filters.user || ''}
          onChange={(e) => onFilterChange('user', e.target.value)}
          className="bg-[#131b2e] border border-slate-800 text-slate-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Users</option>
          {users.filter(Boolean).map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      {/* Reset button */}
      <button
        onClick={onReset}
        className="ml-auto flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded border border-slate-700 transition-colors"
        title="Reset all filters"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Reset</span>
      </button>
    </div>
  );
}
