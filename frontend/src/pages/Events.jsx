import React, { useState, useEffect } from 'react';
import { ListFilter, Plus, RefreshCw, Send, Sparkles } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import EventTable from '../components/EventTable';
import { api } from '../services/api';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    source_type: '',
    severity: '',
    user: ''
  });
  const [showIngestModal, setShowIngestModal] = useState(false);
  const [ingestForm, setIngestForm] = useState({
    source_type: 'AUTHENTICATION',
    event_type: 'LOGIN_FAILED',
    user: 'alex',
    ip_address: '198.51.100.20',
    device: 'UNKNOWN-DEVICE',
    resource: 'sso_portal',
    severity: 'MEDIUM',
    raw_message: 'user=alex failed password verification attempt'
  });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search,
        limit: 100
      };
      const data = await api.getEvents(params);
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 200);
    return () => clearTimeout(timer);
  }, [filters, search]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ source_type: '', severity: '', user: '' });
    setSearch('');
  };

  const handleManualIngest = async (e) => {
    e.preventDefault();
    try {
      await api.ingestEvent(ingestForm);
      setShowIngestModal(false);
      fetchEvents();
    } catch (err) {
      console.error('Error ingesting event:', err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-blue-400" />
            SECURITY EVENT INGESTION & NORMALIZATION REPOSITORY
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Canonical normalized event telemetry collected across enterprise multi-source sensors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIngestModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-mono font-bold shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>INGEST SYNTHETIC EVENT</span>
          </button>

          <button
            onClick={fetchEvents}
            className="p-1.5 bg-[#0f1422] border border-[#1e293b] hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            title="Refresh events"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search by event type, actor, IP address, device, or resource..."
        />
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Events Table */}
      <EventTable events={events} loading={loading} />

      {/* Manual Ingestion Modal */}
      {showIngestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl max-w-lg w-full p-6 shadow-2xl font-mono text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                SIMULATE SYNTHETIC LOG INGESTION
              </h3>
              <button
                onClick={() => setShowIngestModal(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualIngest} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Source Type</label>
                  <select
                    value={ingestForm.source_type}
                    onChange={(e) => setIngestForm({ ...ingestForm, source_type: e.target.value })}
                    className="w-full bg-[#131b2e] border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-blue-500"
                  >
                    <option value="AUTHENTICATION">AUTHENTICATION</option>
                    <option value="NETWORK">NETWORK</option>
                    <option value="ENDPOINT">ENDPOINT</option>
                    <option value="APPLICATION">APPLICATION</option>
                    <option value="DATABASE">DATABASE</option>
                    <option value="FIREWALL">FIREWALL</option>
                    <option value="CLOUD">CLOUD</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Event Type</label>
                  <input
                    type="text"
                    value={ingestForm.event_type}
                    onChange={(e) => setIngestForm({ ...ingestForm, event_type: e.target.value })}
                    className="w-full bg-[#131b2e] border border-slate-800 text-slate-200 rounded p-2 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Target User</label>
                  <input
                    type="text"
                    value={ingestForm.user}
                    onChange={(e) => setIngestForm({ ...ingestForm, user: e.target.value })}
                    className="w-full bg-[#131b2e] border border-slate-800 text-slate-200 rounded p-2"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">IP Address</label>
                  <input
                    type="text"
                    value={ingestForm.ip_address}
                    onChange={(e) => setIngestForm({ ...ingestForm, ip_address: e.target.value })}
                    className="w-full bg-[#131b2e] border border-slate-800 text-slate-200 rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Target Resource</label>
                  <input
                    type="text"
                    value={ingestForm.resource}
                    onChange={(e) => setIngestForm({ ...ingestForm, resource: e.target.value })}
                    className="w-full bg-[#131b2e] border border-slate-800 text-slate-200 rounded p-2"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Severity</label>
                  <select
                    value={ingestForm.severity}
                    onChange={(e) => setIngestForm({ ...ingestForm, severity: e.target.value })}
                    className="w-full bg-[#131b2e] border border-slate-800 text-slate-200 rounded p-2"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Raw Log Message</label>
                <textarea
                  value={ingestForm.raw_message}
                  onChange={(e) => setIngestForm({ ...ingestForm, raw_message: e.target.value })}
                  className="w-full bg-[#131b2e] border border-slate-800 text-slate-200 rounded p-2 h-20"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowIngestModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-400 hover:text-slate-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Normalize & Ingest</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
