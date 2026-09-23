const API_BASE = '/api';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch health');
    return res.json();
  },

  // Events
  async getEvents(params = {}) {
    const query = new URLSearchParams();
    if (params.source_type) query.append('source_type', params.source_type);
    if (params.severity) query.append('severity', params.severity);
    if (params.user) query.append('user', params.user);
    if (params.event_type) query.append('event_type', params.event_type);
    if (params.search) query.append('search', params.search);
    if (params.limit) query.append('limit', params.limit);
    if (params.offset) query.append('offset', params.offset);

    const res = await fetch(`${API_BASE}/events?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return res.json();
  },

  async ingestEvent(eventData) {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error('Failed to ingest event');
    return res.json();
  },

  async getEvent(id) {
    const res = await fetch(`${API_BASE}/events/${id}`);
    if (!res.ok) throw new Error('Failed to fetch event');
    return res.json();
  },

  // Incidents
  async getIncidents(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.severity) query.append('severity', params.severity);
    if (params.limit) query.append('limit', params.limit || 50);

    const res = await fetch(`${API_BASE}/incidents?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async getIncidentDetails(id) {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch incident details');
    return res.json();
  },

  async updateIncidentStatus(id, status) {
    const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update incident status');
    return res.json();
  },

  async triggerAnalysis() {
    const res = await fetch(`${API_BASE}/incidents/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) throw new Error('Failed to trigger correlation analysis');
    return res.json();
  },

  // Dashboard & Analytics
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async getLiveEvents(limit = 15) {
    const res = await fetch(`${API_BASE}/dashboard/live-events?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch live events');
    return res.json();
  },

  async getAnalytics() {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Demo Controls
  async startDemo() {
    const res = await fetch(`${API_BASE}/demo/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to start demo');
    return res.json();
  },

  async simulateIncident(user_target = 'alex', scenario = 'account_compromise') {
    const res = await fetch(`${API_BASE}/demo/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_target, scenario }),
    });
    if (!res.ok) throw new Error('Failed to simulate incident');
    return res.json();
  },
};
