import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { BarChart3, TrendingUp, ShieldAlert, Users, Database, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingState from '../components/LoadingState';
import { api } from '../services/api';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.getAnalytics();
        setData(res);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingState message="Aggregating enterprise telemetry analytics..." />;
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-sm">
        No analytics telemetry available.
      </div>
    );
  }

  // Format events by source for bar chart
  const sourceChartData = Object.entries(data.events_by_source || {}).map(([source, count]) => ({
    source,
    count
  }));

  // Format risk distribution
  const riskChartData = Object.entries(data.risk_distribution || {}).map(([range, count]) => ({
    range,
    count
  }));

  // Format severity breakdown
  const severityColors = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#10b981'
  };

  const severityPieData = Object.entries(data.incidents_by_severity || {}).map(([name, value]) => ({
    name,
    value,
    color: severityColors[name] || '#3b82f6'
  }));

  // Anomaly categories
  const anomalyCategoryData = Object.entries(data.anomaly_categories || {}).map(([category, count]) => ({
    category,
    count
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          SECURITY INTELLIGENCE & TELEMETRY ANALYTICS
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Behavioral baselines, cross-source anomaly clustering, and threat posture metrics
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="AVG THREAT RISK"
          value={`${data.average_risk_score}/100`}
          subtitle="Across all prioritized incidents"
          icon={TrendingUp}
          color="red"
        />
        <StatCard
          title="MOST ANOMALOUS ACTOR"
          value={data.top_anomalous_users?.[0]?.user || 'alex'}
          subtitle={`Score: ${data.top_anomalous_users?.[0]?.cumulative_anomaly || 0}`}
          icon={Users}
          color="amber"
        />
        <StatCard
          title="TARGETED ASSET"
          value="financial_records"
          subtitle="Customer master database"
          icon={Database}
          color="purple"
        />
        <StatCard
          title="PRIMARY VECTOR"
          value="Auth & Egress"
          subtitle="Coordinated compromise"
          icon={ShieldAlert}
          color="blue"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Over Time */}
        <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold font-mono text-slate-200 uppercase">
              Telemetry Volume Over Time (24h Trend)
            </h3>
            <span className="text-[11px] font-mono text-cyan-400">Events / Hour</span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.events_over_time || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1422', borderColor: '#1e293b', fontSize: '11px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#38bdf8' }}
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Events By Source */}
        <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold font-mono text-slate-200 uppercase">
              Events By Ingestion Source
            </h3>
            <span className="text-[11px] font-mono text-blue-400">Multi-source breakdown</span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="source" stroke="#64748b" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1422', borderColor: '#1e293b', fontSize: '11px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incidents by Severity Pie */}
        <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold font-mono text-slate-200 uppercase">
              Incident Severity Distribution
            </h3>
            <span className="text-[11px] font-mono text-red-400">Priority ratios</span>
          </div>

          <div className="h-64 mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1422', borderColor: '#1e293b', fontSize: '11px', fontFamily: 'monospace' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Score Distribution */}
        <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold font-mono text-slate-200 uppercase">
              Incident Risk Score Spread (0-100)
            </h3>
            <span className="text-[11px] font-mono text-amber-400">Classification buckets</span>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f1422', borderColor: '#1e293b', fontSize: '11px', fontFamily: 'monospace' }}
                  labelStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Anomalous Users and Resources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Anomalous Users */}
        <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-bold font-mono text-slate-200 uppercase pb-3 border-b border-slate-800 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            Top Anomalous User Identities
          </h3>

          <div className="mt-3 space-y-2 font-mono text-xs">
            {data.top_anomalous_users?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-[#131b2e]/60 border border-slate-800">
                <span className="font-semibold text-slate-200">#{idx + 1} {item.user}</span>
                <span className="text-amber-400 font-bold">Anomaly Score: {item.cumulative_anomaly}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Affected Resources */}
        <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-5 shadow-lg">
          <h3 className="text-xs font-bold font-mono text-slate-200 uppercase pb-3 border-b border-slate-800 flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            Top Targeted Enterprise Resources
          </h3>

          <div className="mt-3 space-y-2 font-mono text-xs">
            {data.top_affected_resources?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-[#131b2e]/60 border border-slate-800">
                <span className="font-semibold text-slate-200 truncate max-w-[260px]">{item.resource}</span>
                <span className="text-cyan-400 font-bold">{item.access_count} hits</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
