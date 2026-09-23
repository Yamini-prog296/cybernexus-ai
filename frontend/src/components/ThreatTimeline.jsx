import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ExternalLink, 
  Cpu, 
  Sparkles,
  ArrowDown
} from 'lucide-react';
import EventSourceBadge from './EventSourceBadge';
import SeverityBadge from './SeverityBadge';

export default function ThreatTimeline({ events = [], incidentTitle, attackPattern, riskScore }) {
  if (!events || events.length === 0) {
    return (
      <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-6 text-center text-slate-500 font-mono text-sm">
        No correlated events available for timeline reconstruction.
      </div>
    );
  }

  const formatTime = (ts) => {
    try {
      const d = new Date(ts);
      return d.toISOString().substring(11, 19);
    } catch {
      return ts || '00:00:00';
    }
  };

  return (
    <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold font-mono tracking-wide text-slate-100 uppercase">
            CHRONOLOGICAL THREAT TIMELINE
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {events.length} Correlated Sequential Events
        </span>
      </div>

      <div className="relative mt-6 pl-6 sm:pl-8">
        {/* Continuous vertical timeline connector line */}
        <div className="absolute left-[15px] sm:left-[19px] top-2 bottom-6 w-0.5 bg-gradient-to-b from-blue-500 via-amber-500 to-red-500"></div>

        <div className="space-y-6">
          {events.map((evt, index) => {
            const timeStr = formatTime(evt.timestamp);
            const isLast = index === events.length - 1;

            return (
              <div key={evt.id || index} className="relative group">
                {/* Node icon / dot on the line */}
                <div className={`absolute -left-[27px] sm:-left-[31px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-mono font-bold transition-transform group-hover:scale-110 ${
                  evt.severity === 'CRITICAL' || evt.severity === 'HIGH'
                    ? 'border-red-500 bg-red-950 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                    : evt.severity === 'MEDIUM'
                    ? 'border-amber-500 bg-amber-950 text-amber-300'
                    : 'border-blue-500 bg-blue-950 text-blue-300'
                }`}>
                  {index + 1}
                </div>

                {/* Event Card */}
                <div className="bg-[#131b2e]/80 border border-slate-800/90 rounded-lg p-3.5 hover:border-slate-700 transition-all hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 px-2 py-0.5 bg-slate-900/80 rounded border border-slate-800">
                        {timeStr}
                      </span>
                      <EventSourceBadge source={evt.source_type} />
                      <span className="font-mono text-xs font-semibold text-slate-200">
                        {evt.event_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={evt.severity} />
                      <span className="text-[11px] font-mono text-slate-400">
                        Anomaly: <strong className="text-amber-400">{evt.anomaly_score || 0}</strong>
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs font-mono text-slate-300 leading-relaxed bg-[#0a0d14]/60 p-2 rounded border border-slate-800/60">
                    {evt.raw_message || `${evt.source_type} event triggered on ${evt.resource || 'system'}`}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-400">
                    {evt.user && (
                      <span>User: <strong className="text-slate-200">{evt.user}</strong></span>
                    )}
                    {evt.ip_address && (
                      <span>IP: <strong className="text-slate-200">{evt.ip_address}</strong></span>
                    )}
                    {evt.device && (
                      <span>Device: <strong className="text-slate-200">{evt.device}</strong></span>
                    )}
                    {evt.resource && (
                      <span>Resource: <strong className="text-slate-200">{evt.resource}</strong></span>
                    )}
                    {evt.location && (
                      <span>Location: <strong className="text-slate-200">{evt.location}</strong></span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI Final Synthesis Terminal Card */}
          <div className="relative pt-2">
            <div className="absolute -left-[27px] sm:-left-[31px] top-3 w-6 h-6 rounded-full border-2 border-red-500 bg-red-600 text-slate-950 flex items-center justify-center font-bold text-xs shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse">
              !
            </div>

            <div className="bg-gradient-to-r from-red-950/40 via-[#131b2e] to-purple-950/40 border border-red-500/50 rounded-lg p-4 shadow-lg">
              <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                AI CORRELATION: {attackPattern || 'Potential Coordinated Attack Pattern'}
              </div>
              <p className="text-xs text-slate-300 mt-1 font-mono">
                Scattered low/medium alerts correlated into high-confidence threat chain. Multi-stage compromise detected across authentication, endpoint telemetry, and network egress.
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs font-mono">
                <span className="text-slate-400">Assigned Threat Level:</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-red-500 text-slate-950">
                  CRITICAL ({riskScore || 91}/100)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
