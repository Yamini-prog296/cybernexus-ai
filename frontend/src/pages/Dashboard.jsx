import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  Users, 
  Layers, 
  Zap, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Brain
} from 'lucide-react';
import StatCard from '../components/StatCard';
import IncidentTable from '../components/IncidentTable';
import LiveEventStream from '../components/LiveEventStream';
import SystemHealth from '../components/SystemHealth';
import ThreatTimeline from '../components/ThreatTimeline';
import { api } from '../services/api';

export default function Dashboard({ onSelectIncident, setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, incidentsData, healthData] = await Promise.all([
        api.getDashboardStats(),
        api.getIncidents({ limit: 5 }),
        api.getHealth()
      ]);
      setStats(statsData);
      setIncidents(incidentsData);
      setHealth(healthData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const criticalIncident = incidents.find(i => i.severity === 'CRITICAL') || incidents[0];

  return (
    <div className="p-6 space-y-6">
      {/* Top SOC Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="TOTAL EVENTS"
          value={stats?.total_events || 0}
          subtitle="All ingest streams"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="ACTIVE INCIDENTS"
          value={stats?.active_incidents || 0}
          subtitle="Triage queue"
          icon={ShieldAlert}
          color="amber"
        />
        <StatCard
          title="CRITICAL THREATS"
          value={stats?.critical_incidents || 0}
          subtitle="Requires immediate IR"
          icon={AlertTriangle}
          color="red"
        />
        <StatCard
          title="HIGH RISK"
          value={stats?.high_risk_incidents || 0}
          subtitle="Risk score > 70/100"
          icon={Zap}
          color="orange"
        />
        <StatCard
          title="ANOMALIES"
          value={stats?.anomalies_detected || 0}
          subtitle="Behavioral deviations"
          icon={Activity}
          color="cyan"
        />
        <StatCard
          title="AFFECTED USERS"
          value={stats?.affected_users_count || 0}
          subtitle="Distinct user accounts"
          icon={Users}
          color="indigo"
        />
      </div>

      {/* Hero Critical Incident Banner */}
      {criticalIncident && (
        <div className="bg-gradient-to-r from-red-950/40 via-[#0f1422] to-slate-900 border border-red-500/40 rounded-xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-red-500/5 blur-3xl pointer-events-none"></div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-600 text-slate-950 uppercase animate-pulse">
                  CRITICAL INCIDENT ALERT
                </span>
                <span className="text-xs font-mono text-cyan-400 font-semibold">
                  {criticalIncident.id}
                </span>
                <span className="text-xs font-mono text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-400">
                  Confidence: {Math.round(criticalIncident.confidence)}%
                </span>
              </div>

              <h2 className="text-base font-bold font-mono text-slate-100">
                {criticalIncident.title}
              </h2>

              <p className="text-xs text-slate-400 max-w-3xl font-sans">
                {criticalIncident.description}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right font-mono">
                <div className="text-2xl font-black text-red-400">{Math.round(criticalIncident.risk_score)}/100</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">PRIORITY RISK</div>
              </div>

              <button
                onClick={() => onSelectIncident(criticalIncident.id)}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-mono font-bold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
              >
                <span>OPEN INVESTIGATION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Prioritized Queue & Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-400" />
              PRIORITIZED INCIDENT QUEUE (RISK DESCENDING)
            </h3>

            <button
              onClick={() => setActiveTab('incidents')}
              className="text-xs font-mono text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <span>View All Incidents</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <IncidentTable
            incidents={incidents}
            onSelectIncident={onSelectIncident}
            loading={loading}
          />
        </div>

        <div className="space-y-6">
          <LiveEventStream />
          <SystemHealth healthData={health} stats={stats} />
        </div>
      </div>
    </div>
  );
}
