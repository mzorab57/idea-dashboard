import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost/idea-backend/public',
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
  (res) => res,
  (err) => {
    const url = err?.config?.url || '';
    if (err?.response?.status === 401 && !url.includes('/api/admin/login')) {
      useAuthStore.getState().logout();
      localStorage.removeItem('token');
      window.location.replace('/login');
    }
    return Promise.reject(err);
  }
);

export default api;
