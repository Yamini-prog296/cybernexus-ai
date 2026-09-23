import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, Code } from 'lucide-react';
import EventSourceBadge from './EventSourceBadge';
import SeverityBadge from './SeverityBadge';

export default function EventTable({ events = [], loading = false }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  const formatTime = (ts) => {
    try {
      const d = new Date(ts);
      return d.toISOString().replace('T', ' ').substring(0, 19);
    } catch {
      return ts || '-';
    }
  };

  if (loading) {
    return (
      <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-8 text-center text-slate-400 font-mono text-xs">
        <div className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <div>Loading security telemetry events...</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-8 text-center text-slate-500 font-mono text-sm">
        No security events match the selected criteria.
      </div>
    );
  }

  return (
    <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="bg-[#131b2e] border-b border-slate-800 text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3 w-8"></th>
              <th className="py-3 px-3">Timestamp (UTC)</th>
              <th className="py-3 px-3">Source</th>
              <th className="py-3 px-3">Event Type</th>
              <th className="py-3 px-3">User</th>
              <th className="py-3 px-3">IP Address</th>
              <th className="py-3 px-3">Device</th>
              <th className="py-3 px-3">Resource</th>
              <th className="py-3 px-3">Severity</th>
              <th className="py-3 px-3">Anomaly</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {events.map((evt) => {
              const isExpanded = expandedRow === evt.id;
              return (
                <React.Fragment key={evt.id}>
                  <tr
                    onClick={() => toggleRow(evt.id)}
                    className="hover:bg-[#131b2e]/70 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 text-slate-500 text-center">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-cyan-400 font-semibold whitespace-nowrap">
                      {formatTime(evt.timestamp)}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <EventSourceBadge source={evt.source_type} />
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-200 whitespace-nowrap">
                      {evt.event_type}
                    </td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                      {evt.user || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {evt.ip_address || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                      {evt.device || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-[160px] truncate" title={evt.resource}>
                      {evt.resource || '-'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <SeverityBadge severity={evt.severity} />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        (evt.anomaly_score || 0) >= 70
                          ? 'bg-red-950/60 text-red-400 border border-red-800/40'
                          : (evt.anomaly_score || 0) >= 40
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {Math.round(evt.anomaly_score || 0)}
                      </span>
                    </td>
                  </tr>

                  {/* Expanded Row Detail */}
                  {isExpanded && (
                    <tr className="bg-[#0b0f19] border-y border-blue-900/40">
                      <td colSpan={10} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-blue-400" />
                              Raw Log Message
                            </div>
                            <div className="bg-[#070a10] border border-slate-800 p-2.5 rounded font-mono text-xs text-amber-300 break-all select-all">
                              {evt.raw_message || 'N/A'}
                            </div>
                          </div>

                          <div>
                            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <Code className="w-3.5 h-3.5 text-cyan-400" />
                              Normalized Structured JSON Payload
                            </div>
                            <pre className="bg-[#070a10] border border-slate-800 p-2.5 rounded font-mono text-[11px] text-slate-300 overflow-x-auto max-h-36">
                              {JSON.stringify(evt.normalized_data || evt, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
