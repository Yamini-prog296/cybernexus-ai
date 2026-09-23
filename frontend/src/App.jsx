import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import IncidentDetails from './pages/IncidentDetails';
import Events from './pages/Events';
import Analytics from './pages/Analytics';
import DemoMode from './pages/DemoMode';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [activeIncidentsCount, setActiveIncidentsCount] = useState(0);
  const [aiMode, setAiMode] = useState('LOCAL AI (Deterministic)');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchGlobalStats = async () => {
    try {
      const stats = await api.getDashboardStats();
      setActiveIncidentsCount(stats.active_incidents || 0);
      setAiMode(stats.ai_provider || 'LOCAL AI (Deterministic)');
    } catch (err) {
      console.error('Error fetching global stats:', err);
    }
  };

  useEffect(() => {
    fetchGlobalStats();
    const interval = setInterval(fetchGlobalStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSelectIncident = (id) => {
    setSelectedIncidentId(id);
    setActiveTab('incident-details');
  };

  const handleTriggerDemo = async () => {
    try {
      setIsAnalyzing(true);
      const res = await api.startDemo();
      showToast(`CYBERNEXUS AI Demo State Initialized (${res.incidents_created} Incidents, ${res.events_ingested} Logs)`, 'success');
      await fetchGlobalStats();
      setActiveTab('dashboard');
    } catch (err) {
      showToast('Failed to initialize demo state', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSimulate = async () => {
    try {
      setIsAnalyzing(true);
      const res = await api.simulateIncident('alex', 'account_compromise');
      showToast(`Simulated attack telemetry injected for user alex. Incident ${res.incident_created} generated!`, 'success');
      await fetchGlobalStats();
      if (res.incident_created) {
        handleSelectIncident(res.incident_created);
      } else {
        setActiveTab('incidents');
      }
    } catch (err) {
      showToast('Failed to simulate incident', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070a10] text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab === 'incident-details' ? 'incidents' : activeTab}
        setActiveTab={(tab) => {
          setSelectedIncidentId(null);
          setActiveTab(tab);
        }}
        activeIncidentsCount={activeIncidentsCount}
      />

      {/* Main SOC Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar Command Header */}
        <Topbar
          onTriggerDemo={handleTriggerDemo}
          onSimulate={handleSimulate}
          aiMode={aiMode}
          isAnalyzing={isAnalyzing}
        />

        {/* Global Toast Notification */}
        {notification && (
          <div className="fixed top-20 right-6 z-50 animate-bounce">
            <div className={`px-4 py-2.5 rounded-lg border font-mono text-xs shadow-2xl flex items-center gap-2 ${
              notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300'
                : notification.type === 'error'
                ? 'bg-red-950/90 border-red-500 text-red-300'
                : 'bg-blue-950/90 border-blue-500 text-blue-300'
            }`}>
              <span className="w-2 h-2 rounded-full bg-current"></span>
              <span>{notification.message}</span>
            </div>
          </div>
        )}

        {/* Main Workspace Area */}
        <main className="flex-1 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              onSelectIncident={handleSelectIncident}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'incidents' && (
            <Incidents
              onSelectIncident={handleSelectIncident}
            />
          )}

          {activeTab === 'incident-details' && (
            <IncidentDetails
              incidentId={selectedIncidentId}
              onBack={() => setActiveTab('incidents')}
            />
          )}

          {activeTab === 'events' && (
            <Events />
          )}

          {activeTab === 'analytics' && (
            <Analytics />
          )}

          {activeTab === 'demo' && (
            <DemoMode
              onSelectIncident={handleSelectIncident}
            />
          )}
        </main>
      </div>
    </div>
  );
}
