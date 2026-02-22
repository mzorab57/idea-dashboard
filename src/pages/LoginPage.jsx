import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../api/axiosConfig';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (values) => {
    try {
      const res = await api.post('/api/admin/login', values);
      login({ token: res.data.token, user: { name: res.data.name, role: res.data.role } });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        (err?.response?.status ? `Error ${err.response.status}` : 'Network error: unable to reach API');
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center ">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white shadow-2xl shadow-primary/30">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-500">Sign in to your admin account</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200/50 p-4 transition-all hover:shadow-gray-300/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Mail className="w-4 h-4 text-gray-500" />
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  {/* <Mail className="w-5 h-5" /> */}
                </div>
                <input
                  className={`w-full pl-3 pr-4 py-4 bg-gray-50/80 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                    errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-transparent'
                  }`}
                  placeholder="admin@example.com"
                  type="email"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Lock className="w-4 h-4 text-gray-500" />
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  {/* <Lock className="w-5 h-5" /> */}
                </div>
                <input
                  className={`w-full pl-3 pr-12 py-4 bg-gray-50/80 border-2 rounded-xl text-gray-900 placeholder-gray-400 transition-all focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                    errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-transparent'
                  }`}
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full inline-flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity rounded-xl" />
            </button>
          </form>
          {error && (
            <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Need help? <a href="#" className="font-semibold text-primary hover:text-secondary transition-colors">Contact support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
