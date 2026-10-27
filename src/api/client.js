import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (credentials) => api.post('/api/v1/auth/login', credentials),
  register: (userData) => api.post('/api/v1/auth/register', userData),
  me: () => api.get('/api/v1/auth/me'),
  logout: () => api.post('/api/v1/auth/logout'),
};

export const agentsApi = {
  list: (params) => api.get('/api/v1/agents', { params }),
  get: (id) => api.get(`/api/v1/agents/${id}`),
  create: (data) => api.post('/api/v1/agents', data),
  update: (id, data) => api.put(`/api/v1/agents/${id}`, data),
  delete: (id) => api.delete(`/api/v1/agents/${id}`),
  updateStatus: (id, status) => api.put(`/api/v1/agents/${id}/status`, { availability_status: status }),
};

export const customersApi = {
  list: (params) => api.get('/api/v1/customers', { params }),
  get: (id) => api.get(`/api/v1/customers/${id}`),
  create: (data) => api.post('/api/v1/customers', data),
  update: (id, data) => api.put(`/api/v1/customers/${id}`, data),
  delete: (id) => api.delete(`/api/v1/customers/${id}`),
};

export const interactionsApi = {
  list: (params) => api.get('/api/v1/interactions', { params }),
  get: (id) => api.get(`/api/v1/interactions/${id}`),
  create: (data) => api.post('/api/v1/interactions', data),
  routeSingle: (id) => api.post(`/api/v1/interactions/${id}/route`),
  routeAll: () => api.post('/api/v1/interactions/route-all'),
  resolve: (id, notes) => api.post(`/api/v1/interactions/${id}/resolve`, { resolution_notes: notes }),
  simulate: () => api.post('/api/v1/interactions/simulate'),
};

export const ticketsApi = {
  list: (params) => api.get('/api/v1/tickets', { params }),
  get: (id) => api.get(`/api/v1/tickets/${id}`),
  create: (data) => api.post('/api/v1/tickets', data),
  update: (id, data) => api.put(`/api/v1/tickets/${id}`, data),
  delete: (id) => api.delete(`/api/v1/tickets/${id}`),
};

export const almApi = {
  // Projects
  getProjects: (params) => api.get('/api/v1/alm/projects', { params }),
  getProject: (id) => api.get(`/api/v1/alm/projects/${id}`),
  createProject: (data) => api.post('/api/v1/alm/projects', data),
  updateProject: (id, data) => api.put(`/api/v1/alm/projects/${id}`, data),

  // Requirements
  getRequirements: (params) => api.get('/api/v1/alm/requirements', { params }),
  getRequirement: (id) => api.get(`/api/v1/alm/requirements/${id}`),
  createRequirement: (data) => api.post('/api/v1/alm/requirements', data),
  updateRequirement: (id, data) => api.put(`/api/v1/alm/requirements/${id}`, data),
  deleteRequirement: (id) => api.delete(`/api/v1/alm/requirements/${id}`),

  // Tasks
  getTasks: (params) => api.get('/api/v1/alm/tasks', { params }),
  getTask: (id) => api.get(`/api/v1/alm/tasks/${id}`),
  createTask: (data) => api.post('/api/v1/alm/tasks', data),
  updateTask: (id, data) => api.put(`/api/v1/alm/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/api/v1/alm/tasks/${id}`),

  // Defects
  getDefects: (params) => api.get('/api/v1/alm/defects', { params }),
  getDefect: (id) => api.get(`/api/v1/alm/defects/${id}`),
  createDefect: (data) => api.post('/api/v1/alm/defects', data),
  updateDefect: (id, data) => api.put(`/api/v1/alm/defects/${id}`, data),
  deleteDefect: (id) => api.delete(`/api/v1/alm/defects/${id}`),

  // Test Cases
  getTestCases: (params) => api.get('/api/v1/alm/test-cases', { params }),
  getTestCase: (id) => api.get(`/api/v1/alm/test-cases/${id}`),
  createTestCase: (data) => api.post('/api/v1/alm/test-cases', data),
  updateTestCase: (id, data) => api.put(`/api/v1/alm/test-cases/${id}`, data),
  deleteTestCase: (id) => api.delete(`/api/v1/alm/test-cases/${id}`),

  // Test Runs
  getTestRuns: (params) => api.get('/api/v1/alm/test-runs', { params }),
  executeTestRun: (data) => api.post('/api/v1/alm/test-runs', data),

  // Traceability Matrix
  getTraceability: (params) => api.get('/api/v1/alm/traceability', { params }),
};

export const impactApi = {
  getImpact: (reqId) => api.get(`/api/v1/alm/impact/${reqId}`),
  flagRerun: (reqId, changeReason) => api.post(`/api/v1/alm/impact/${reqId}/flag-rerun`, { change_reason: changeReason }),
};

export const releasesApi = {
  list: (params) => api.get('/api/v1/releases', { params }),
  get: (id) => api.get(`/api/v1/releases/${id}`),
  create: (data) => api.post('/api/v1/releases', data),
  update: (id, data) => api.put(`/api/v1/releases/${id}`, data),
  linkRequirements: (id, reqIds) => api.post(`/api/v1/releases/${id}/requirements`, { requirement_ids: reqIds }),
  getReadiness: (id) => api.get(`/api/v1/releases/${id}/readiness`),
  approve: (id, decision, notes) => api.post(`/api/v1/releases/${id}/approve`, { decision, decision_notes: notes }),
};

export const deploymentsApi = {
  list: (params) => api.get('/api/v1/deployments', { params }),
  get: (id) => api.get(`/api/v1/deployments/${id}`),
  simulate: (releaseId, forceFailure = false) => api.post('/api/v1/deployments/simulate', { release_id: releaseId, force_failure: forceFailure }),
  rollback: (deploymentId, reason) => api.post(`/api/v1/deployments/${deploymentId}/rollback`, { reason }),
};

export const analyticsApi = {
  getContactCenter: () => api.get('/api/v1/analytics/contact-center'),
  getAlm: () => api.get('/api/v1/analytics/alm'),
};

export const auditApi = {
  getLogs: (params) => api.get('/api/v1/audit-logs', { params }),
  getNotifications: (params) => api.get('/api/v1/notifications', { params }),
  markRead: (id) => api.put(`/api/v1/notifications/${id}/read`),
  markAllRead: () => api.put('/api/v1/notifications/mark-all-read'),
};

export const adminApi = {
  getUsers: () => api.get('/api/v1/admin/users'),
  createUser: (data) => api.post('/api/v1/admin/users', data),
  updateUser: (id, data) => api.put(`/api/v1/admin/users/${id}`, data),
  getRoles: () => api.get('/api/v1/admin/roles'),
  getSystemInfo: () => api.get('/api/v1/admin/system-info'),
};

export default api;
