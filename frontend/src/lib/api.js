import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Territory APIs
export const territoryAPI = {
  getAll: () => api.get('/territories'),
  getOne: (id) => api.get(`/territories/${id}`),
  create: (data) => api.post('/territories', data),
  update: (id, data) => api.put(`/territories/${id}`, data),
  delete: (id) => api.delete(`/territories/${id}`),
};

// Comment APIs
export const commentAPI = {
  create: (data) => api.post('/comments', data),
  getByTerritory: (territoryId) => api.get(`/comments/${territoryId}`),
};

// Data Gathering APIs
export const dataGatheringAPI = {
  submit: (data) => api.post('/data-gathering', data),
  getByTerritory: (territoryId) => api.get(`/data-gathering/${territoryId}`),
};

// Metrics History APIs
export const metricsAPI = {
  getHistory: (territoryId) => api.get(`/metrics-history/${territoryId}`),
};

export default api;