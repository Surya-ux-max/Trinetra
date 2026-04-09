const API_BASE = 'http://localhost:8000';

export const api = {
  getAlertHistory: async () => {
    const response = await fetch(`${API_BASE}/alerts/history`);
    return response.json();
  },

  clearAlertHistory: async () => {
    const response = await fetch(`${API_BASE}/alerts/history`, { method: 'DELETE' });
    return response.json();
  },

  getSectorStatus: async () => {
    const response = await fetch(`${API_BASE}/sectors/status`);
    return response.json();
  },

  startStream: async (sectorId, url) => {
    const response = await fetch(`${API_BASE}/start-stream/${sectorId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return response.json();
  },

  stopStream: async (sectorId) => {
    const response = await fetch(`${API_BASE}/stop-stream/${sectorId}`, { method: 'POST' });
    return response.json();
  },

  sendCommand: async (message) => {
    const response = await fetch(`${API_BASE}/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    return response.json();
  },
};

export const WS_URL = 'ws://localhost:8000/ws';
export const LIVE_FEED_URL = (sectorId) => `${API_BASE}/live/${sectorId}`;
