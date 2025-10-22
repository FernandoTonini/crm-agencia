import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/api/auth/login', { email, password }),
  register: (name, email, password) => api.post('/api/auth/register', { name, email, password }),
  me: () => api.get('/api/auth/me'),
};

export const leadsAPI = {
  getAll: () => api.get('/api/leads'),
  getById: (id) => api.get(`/api/leads/${id}`),
  create: (data) => api.post('/api/leads', data),
  update: (id, data) => api.put(`/api/leads/${id}`, data),
  delete: (id) => api.delete(`/api/leads/${id}`),
  export: (type) => api.get(`/api/leads/export/${type}`),
};

export const contractsAPI = {
  getAll: () => api.get('/api/contracts'),
  getById: (id) => api.get(`/api/contracts/${id}`),
  getByLeadId: (leadId) => api.get(`/api/contracts/lead/${leadId}`),
  create: (data) => api.post('/api/contracts', data),
  update: (id, data) => api.put(`/api/contracts/${id}`, data),
  delete: (id) => api.delete(`/api/contracts/${id}`),
  getRenewals: (days = 30) => api.get(`/api/contracts/renewals/${days}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
};

export default api;
