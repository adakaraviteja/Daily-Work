const API_BASE_URL = 'http://localhost:5000/api';

async function fetchJSON(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`API Call failed (${endpoint}):`, error);
    throw error;
  }
}

export const api = {
  // Members
  getMembers: () => fetchJSON('/members'),
  addMember: (data) => fetchJSON('/members', { method: 'POST', body: JSON.stringify(data) }),

  // Projects
  getProjects: () => fetchJSON('/projects'),
  addProject: (data) => fetchJSON('/projects', { method: 'POST', body: JSON.stringify(data) }),

  // Attendance
  getAttendance: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJSON(`/attendance?${query}`);
  },
  lookupAttendance: (member_id, date) => {
    return fetchJSON(`/attendance/lookup?member_id=${member_id}&date=${date}`);
  },
  saveAttendance: (data) => fetchJSON('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  deleteAttendance: (id) => fetchJSON(`/attendance/${id}`, { method: 'DELETE' }),

  // Tasks (Daily Task Log - One row per task)
  getTasks: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJSON(`/tasks?${query}`);
  },
  addTask: (data) => fetchJSON('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => fetchJSON(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id) => fetchJSON(`/tasks/${id}`, { method: 'DELETE' }),

  // Analytics & Summary
  getDailySummary: (date, member_id) => {
    const query = new URLSearchParams({ date, ...(member_id ? { member_id } : {}) }).toString();
    return fetchJSON(`/analytics/daily-summary?${query}`);
  },
  getOverview: () => fetchJSON('/analytics/overview'),
  resetSeed: () => fetchJSON('/seed', { method: 'POST' })
};
