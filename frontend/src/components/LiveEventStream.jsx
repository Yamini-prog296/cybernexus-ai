import React, { useState, useEffect } from 'react';
import { Radio, Pause, Play, Activity } from 'lucide-react';
import EventSourceBadge from './EventSourceBadge';
import SeverityBadge from './SeverityBadge';
import { api } from '../services/api';

export default function LiveEventStream() {
  const [events, setEvents] = useState([]);
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval = null;

    const fetchLatest = async () => {
      try {
        const data = await api.getLiveEvents(12);
        setEvents(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching live events:', err);
      }
    };

    fetchLatest();

    if (isLive) {
      interval = setInterval(fetchLatest, 3500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLive]);

  return (
    <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-4 shadow-lg flex flex-col">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className={`w-2.5 h-2.5 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
          </div>
          <h3 className="text-xs font-bold font-mono tracking-wider text-slate-100 uppercase flex items-center gap-2">
            LIVE EVENT STREAM
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-normal">
              REAL-TIME
            </span>
          </h3>
        </div>

        <button
          onClick={() => setIsLive(!isLive)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
            isLive
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/50'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
          }`}
        >
          {isLive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {isLive ? 'LIVE ON' : 'PAUSED'}
        </button>
      </div>

      <div className="mt-3 space-y-2 max-h-[320px] overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500">
            Waiting for inbound security event telemetry...
          </div>
        ) : (
          events.map((evt) => {
            const timeStr = evt.timestamp ? new Date(evt.timestamp).toISOString().substring(11, 19) : '--:--:--';
            return (
              <div
                key={evt.id}
                className="bg-[#131b2e]/60 hover:bg-[#131b2e] border border-slate-800/80 hover:border-slate-700 rounded-lg p-2.5 transition-all text-xs font-mono flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-cyan-400 font-bold shrink-0">{timeStr}</span>
                  <EventSourceBadge source={evt.source_type} />
                  <span className="font-semibold text-slate-200 truncate">{evt.event_type}</span>
                  {evt.user && (
                    <span className="text-slate-400 truncate hidden sm:inline">
                      user:<strong className="text-slate-300">{evt.user}</strong>
                    </span>
                  )}
                  {evt.ip_address && (
                    <span className="text-slate-500 truncate hidden md:inline">
                      ({evt.ip_address})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <SeverityBadge severity={evt.severity} />
                  <span className="text-[10px] text-amber-400/90 font-mono">
                    {Math.round(evt.anomaly_score || 0)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
