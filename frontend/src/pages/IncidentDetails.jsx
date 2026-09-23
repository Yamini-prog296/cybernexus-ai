import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Laptop, 
  Database,
  Calendar,
  Layers,
  Sparkles,
  Share2
} from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import RiskScore from '../components/RiskScore';
import AIExplanation from '../components/AIExplanation';
import ThreatTimeline from '../components/ThreatTimeline';
import RecommendationPanel from '../components/RecommendationPanel';
import CorrelationGraph from '../components/CorrelationGraph';
import EventTable from '../components/EventTable';
import LoadingState from '../components/LoadingState';
import { api } from '../services/api';

export default function IncidentDetails({ incidentId, onBack }) {
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('overview'); // overview, timeline, events

  const fetchIncident = async () => {
    try {
      setLoading(true);
      const data = await api.getIncidentDetails(incidentId);
      setIncident(data);
    } catch (err) {
      console.error('Error fetching incident:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (incidentId) {
      fetchIncident();
    }
  }, [incidentId]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const updated = await api.updateIncidentStatus(incidentId, newStatus);
      setIncident(prev => ({ ...prev, status: updated.status }));
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading incident investigation workspace..." />;
  }

  if (!incident) {
    return (
      <div className="p-8 text-center font-mono text-slate-400">
        <p>Incident not found or unavailable.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 rounded text-xs"
        >
          Return to Incident Queue
        </button>
      </div>
    );
  }

  const formatTime = (ts) => {
    try {
      const d = new Date(ts);
      return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    } catch {
      return ts || '-';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Navigation & Status Workflow Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incident Queue</span>
        </button>

        {/* SOC Action Buttons (updates backend directly) */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-slate-500 mr-1 text-[11px] font-semibold">UPDATE SOC STATUS:</span>
          
          <button
            onClick={() => handleStatusUpdate('ACKNOWLEDGED')}
            disabled={updatingStatus || incident.status === 'ACKNOWLEDGED'}
            className={`px-3 py-1.5 rounded border transition-all ${
              incident.status === 'ACKNOWLEDGED'
                ? 'bg-purple-600/30 border-purple-500 text-purple-300 font-bold'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            ACKNOWLEDGE
          </button>

          <button
            onClick={() => handleStatusUpdate('INVESTIGATING')}
            disabled={updatingStatus || incident.status === 'INVESTIGATING'}
            className={`px-3 py-1.5 rounded border transition-all ${
              incident.status === 'INVESTIGATING'
                ? 'bg-amber-600/30 border-amber-500 text-amber-300 font-bold'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            INVESTIGATE
          </button>

          <button
            onClick={() => handleStatusUpdate('RESOLVED')}
            disabled={updatingStatus || incident.status === 'RESOLVED'}
            className={`px-3 py-1.5 rounded border transition-all ${
              incident.status === 'RESOLVED'
                ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            RESOLVED
          </button>
        </div>
      </div>

      {/* Incident Header Card */}
      <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-blue-950/70 text-blue-400 border border-blue-800/50">
                {incident.id}
              </span>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {incident.attack_pattern}
              </span>
              <SeverityBadge severity={incident.severity} />
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                incident.status === 'RESOLVED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}>
                STATUS: {incident.status}
              </span>
            </div>

            <h1 className="text-lg font-bold font-mono text-slate-100">
              {incident.title}
            </h1>

            <p className="text-xs text-slate-400 font-sans max-w-4xl">
              {incident.description}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <RiskScore score={incident.risk_score} size="lg" />
          </div>
        </div>

        {/* Affected metadata chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs font-mono">
          <div className="bg-[#131b2e]/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block uppercase flex items-center gap-1">
              <User className="w-3 h-3 text-blue-400" />
              Target User(s)
            </span>
            <span className="text-slate-200 font-bold mt-0.5 block">
              {incident.affected_users?.join(', ') || 'N/A'}
            </span>
          </div>

          <div className="bg-[#131b2e]/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block uppercase flex items-center gap-1">
              <Laptop className="w-3 h-3 text-purple-400" />
              Devices Involved
            </span>
            <span className="text-slate-200 font-bold mt-0.5 block truncate">
              {incident.affected_devices?.join(', ') || 'Rogue Device'}
            </span>
          </div>

          <div className="bg-[#131b2e]/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block uppercase flex items-center gap-1">
              <Database className="w-3 h-3 text-rose-400" />
              Impacted Assets
            </span>
            <span className="text-slate-200 font-bold mt-0.5 block truncate">
              {incident.affected_resources?.join(', ') || 'Enterprise Asset'}
            </span>
          </div>

          <div className="bg-[#131b2e]/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-slate-400 text-[10px] block uppercase flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              Temporal Window
            </span>
            <span className="text-cyan-400 font-bold mt-0.5 block text-[11px]">
              {formatTime(incident.first_seen)}
            </span>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 font-mono text-xs">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2 border-b-2 font-semibold transition-colors ${
            activeSubTab === 'overview'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Investigation & XAI
        </button>
        <button
          onClick={() => setActiveSubTab('timeline')}
          className={`px-4 py-2 border-b-2 font-semibold transition-colors ${
            activeSubTab === 'timeline'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Threat Timeline ({incident.correlated_events?.length || 0})
        </button>
        <button
          onClick={() => setActiveSubTab('events')}
          className={`px-4 py-2 border-b-2 font-semibold transition-colors ${
            activeSubTab === 'events'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Correlated Logs Table
        </button>
      </div>

      {/* Sub Tab Content */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <AIExplanation
            explanation={incident.ai_explanation}
            factorBreakdown={incident.factor_breakdown}
            riskScore={incident.risk_score}
            confidence={incident.confidence}
          />

          <CorrelationGraph
            incident={incident}
            events={incident.correlated_events || []}
          />

          <RecommendationPanel
            recommendations={incident.recommended_action || []}
            attackPattern={incident.attack_pattern}
          />
        </div>
      )}

      {activeSubTab === 'timeline' && (
        <ThreatTimeline
          events={incident.correlated_events || []}
          incidentTitle={incident.title}
          attackPattern={incident.attack_pattern}
          riskScore={incident.risk_score}
        />
      )}

      {activeSubTab === 'events' && (
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-400">
            All telemetry events correlated into Incident {incident.id}:
          </div>
          <EventTable events={incident.correlated_events || []} />
        </div>
      )}
    </div>
  );
}
