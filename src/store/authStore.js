import { create } from 'zustand';
import api from '../api/axiosConfig';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isHydrated: false,
  hydrate: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ user: null, token: null, isAuthenticated: false, isHydrated: true });
        return;
      }
      const res = await api.get('/api/admin/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const me = res.data;
      set({ user: me, isAuthenticated: true, token, isHydrated: true });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, isHydrated: true });
    }
  },
  login: (payload) => {
    const { token, user } = payload;
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true, isHydrated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false, isHydrated: true });
  },
}));
