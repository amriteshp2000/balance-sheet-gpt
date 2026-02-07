// src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('finbot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('finbot_token');
      localStorage.removeItem('finbot_user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// Dashboard APIs
export const dashboardAPI = {
  getData: async (role, company = null, query = 'summary') => {
    const response = await api.post('/api/dashboard/data', { role, company, query });
    return response.data;
  },
};

// Chat APIs
export const chatAPI = {
  sendMessage: async (query, role, company = null) => {
    const response = await api.post('/api/chat', { query, role, company });
    return response.data;
  },
};

// Upload APIs
export const uploadAPI = {
  uploadPDF: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress?.(percentCompleted);
      },
    });
    return response.data;
  },
  
  // New: Assign data to role
  assignToRole: async (fileId, targetRole, targetCompany) => {
    const response = await api.post('/api/data/assign', {
      file_id: fileId,
      target_role: targetRole,
      target_company: targetCompany,
    });
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },
  
  info: async () => {
    const response = await api.get('/api/info');
    return response.data;
  },
};

export default api;