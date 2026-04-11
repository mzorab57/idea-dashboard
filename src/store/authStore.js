import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  hydrate: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/admin/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const me = await res.json();
      set({ user: me, isAuthenticated: true, token });
    } catch {
      // ignore
    }
  },
  login: (payload) => {
    const { token, user } = payload;
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
