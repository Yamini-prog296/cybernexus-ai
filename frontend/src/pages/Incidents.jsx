import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, Sparkles, Filter, Grid, List } from 'lucide-react';
import IncidentTable from '../components/IncidentTable';
import IncidentCard from '../components/IncidentCard';
import { api } from '../services/api';

export default function Incidents({ onSelectIncident }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [isCorrelating, setIsCorrelating] = useState(false);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidents({
        status: statusFilter,
        severity: severityFilter
      });
      setIncidents(data);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, severityFilter]);

  const handleRunCorrelation = async () => {
    try {
      setIsCorrelating(true);
      await api.triggerAnalysis();
      await fetchIncidents();
    } catch (err) {
      console.error('Error triggering correlation:', err);
    } finally {
      setIsCorrelating(false);
    }
  };

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'New', value: 'NEW' },
    { label: 'Acknowledged', value: 'ACKNOWLEDGED' },
    { label: 'Investigating', value: 'INVESTIGATING' },
    { label: 'Resolved', value: 'RESOLVED' },
  ];

  const severityOptions = [
    { label: 'All Severities', value: '' },
    { label: 'Critical', value: 'CRITICAL' },
    { label: 'High', value: 'HIGH' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Low', value: 'LOW' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            SECURITY INCIDENT TRIAGE & PRIORITIZATION CENTER
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Incidents automatically ranked by risk score (Formula: 30% Anomaly + 25% Correlation + 20% Behaviour + 15% Sensitivity + 10% Severity)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunCorrelation}
            disabled={isCorrelating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold shadow-md transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isCorrelating ? 'animate-spin' : ''}`} />
            <span>RUN CORRELATION ENGINE</span>
          </button>

          <button
            onClick={fetchIncidents}
            className="p-1.5 bg-[#0f1422] border border-[#1e293b] hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* View toggle */}
          <div className="flex items-center bg-[#0f1422] border border-[#1e293b] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs ${viewMode === 'table' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500'}`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded text-xs ${viewMode === 'grid' ? 'bg-blue-600/20 text-blue-400' : 'text-slate-500'}`}
              title="Card grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0f1422] border border-[#1e293b] rounded-xl p-3 text-xs font-mono">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-slate-500 mr-2 text-[11px] font-semibold">STATUS:</span>
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === opt.value
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-[#131b2e] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Severity Filters */}
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-slate-500 mr-2 text-[11px] font-semibold">SEVERITY:</span>
          {severityOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setSeverityFilter(opt.value)}
              className={`px-2.5 py-1 rounded transition-colors ${
                severityFilter === opt.value
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-[#131b2e] text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Presentation */}
      {viewMode === 'table' ? (
        <IncidentTable
          incidents={incidents}
          onSelectIncident={onSelectIncident}
          loading={loading}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {incidents.map(inc => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              onSelect={onSelectIncident}
            />
          ))}
        </div>
      )}
    </div>
  );
}
