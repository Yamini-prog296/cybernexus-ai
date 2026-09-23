import React from 'react';
import { Share2, User, Globe, Laptop, Database, Activity } from 'lucide-react';

export default function CorrelationGraph({ incident, events = [] }) {
  if (!incident) return null;

  const users = incident.affected_users || [];
  const devices = incident.affected_devices || [];
  const resources = incident.affected_resources || [];
  const ips = Array.from(new Set(events.map(e => e.ip_address).filter(Boolean)));

  return (
    <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold font-mono tracking-wide text-slate-100 uppercase">
            MULTI-DIMENSIONAL CORRELATION GRAPH
          </h3>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2 py-0.5 rounded">
          Cluster Density: High
        </span>
      </div>

      <p className="text-xs text-slate-400 mt-3 font-mono">
        Correlated identity and infrastructure convergence vectors linking {events.length} security events across separate systems:
      </p>

      {/* Visual node interconnection web */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {/* User Node */}
        <div className="bg-[#131b2e] border border-blue-500/40 rounded-lg p-3 relative group hover:border-blue-400 transition-colors">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 mb-2">
            <User className="w-4 h-4" />
            ACTOR ENTITY
          </div>
          <div className="space-y-1">
            {users.length > 0 ? (
              users.map((u, i) => (
                <div key={i} className="text-xs font-mono bg-slate-900/80 px-2 py-1 rounded text-slate-200 border border-slate-800">
                  {u}
                </div>
              ))
            ) : (
              <div className="text-xs font-mono text-slate-500">Unspecified User</div>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-2 block">Origin Identity Anchor</span>
        </div>

        {/* IP Node */}
        <div className="bg-[#131b2e] border border-amber-500/40 rounded-lg p-3 relative group hover:border-amber-400 transition-colors">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 mb-2">
            <Globe className="w-4 h-4" />
            NETWORK ENDPOINTS
          </div>
          <div className="space-y-1">
            {ips.length > 0 ? (
              ips.slice(0, 3).map((ip, i) => (
                <div key={i} className="text-xs font-mono bg-slate-900/80 px-2 py-1 rounded text-slate-200 border border-slate-800">
                  {ip}
                </div>
              ))
            ) : (
              <div className="text-xs font-mono text-slate-500">Internal Subnet</div>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-2 block">Observed Geo/IP Ingress</span>
        </div>

        {/* Device Node */}
        <div className="bg-[#131b2e] border border-purple-500/40 rounded-lg p-3 relative group hover:border-purple-400 transition-colors">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 mb-2">
            <Laptop className="w-4 h-4" />
            HOST / HARDWARE
          </div>
          <div className="space-y-1">
            {devices.length > 0 ? (
              devices.slice(0, 3).map((dev, i) => (
                <div key={i} className="text-xs font-mono bg-slate-900/80 px-2 py-1 rounded text-slate-200 border border-slate-800">
                  {dev}
                </div>
              ))
            ) : (
              <div className="text-xs font-mono text-slate-500">Standard Workstation</div>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-2 block">Unrecognized Fingerprint</span>
        </div>

        {/* Target Resource Node */}
        <div className="bg-[#131b2e] border border-rose-500/40 rounded-lg p-3 relative group hover:border-rose-400 transition-colors">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400 mb-2">
            <Database className="w-4 h-4" />
            CRITICAL ASSETS
          </div>
          <div className="space-y-1">
            {resources.length > 0 ? (
              resources.slice(0, 3).map((res, i) => (
                <div key={i} className="text-xs font-mono bg-slate-900/80 px-2 py-1 rounded text-slate-200 border border-slate-800 truncate" title={res}>
                  {res}
                </div>
              ))
            ) : (
              <div className="text-xs font-mono text-slate-500">Enterprise Assets</div>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-2 block">High-Value Target Touched</span>
        </div>
      </div>
    </div>
  );
}
