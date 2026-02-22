import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUser, updateUser } from '../../services/admin';
import { toast } from 'react-toastify';

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const schema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().optional(),
  role: z.string().optional(),
  is_active: z.boolean().optional(),
});

export default function UsersModal({ open, mode = 'create', initial, onClose, onSuccess }) {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', email: '', password: '', role: 'employee', is_active: true },
  });
  const isActiveVal = watch('is_active');

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initial) {
      reset({
        full_name: initial.full_name || '',
        email: initial.email || '',
        password: '',
        role: initial.role || 'employee',
        is_active: !!initial.is_active,
      });
    } else {
      reset({ full_name: '', email: '', password: '', role: 'employee', is_active: true });
    }
  }, [open, mode, initial, reset]);

  const onSubmit = async (values) => {
    if (mode === 'create' && (!values.password || values.password.length < 6)) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    const payload = {
      full_name: values.full_name,
      email: values.email,
      password: values.password || '',
      role: values.role || 'employee',
      is_active: values.is_active ? 1 : 0,
    };
    try {
      if (mode === 'edit' && initial?.id) {
        await updateUser(initial.id, payload);
        toast.success('User updated successfully');
      } else {
        await createUser(payload);
        toast.success('User created successfully');
      }
      onClose?.();
      onSuccess?.();
    } catch (err) {
      toast.error(err?.message || 'Action failed');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-slideUp overflow-hidden">
        <div className="sticky top-0 z-10 px-6 py-5 bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
              <UserIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'edit' ? 'Edit User' : 'New User'}
              </h2>
              <p className="text-sm text-rose-100">
                {mode === 'edit' ? 'Update user details' : 'Add a new user'}
              </p>
            </div>
          </div>
          <button
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 backdrop-blur text-white hover:bg-white/30 flex items-center justify-center"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <UserIcon />
                Full Name
              </label>
              <input
                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 ${errors.full_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-transparent'}`}
                placeholder="Enter full name"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-red-500 text-sm">Required</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <LinkIcon />
                Email
              </label>
              <input
                type="email"
                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 ${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-transparent'}`}
                placeholder="name@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">Invalid email</p>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <LinkIcon />
                {mode === 'edit' ? 'Password (optional)' : 'Password'}
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder={mode === 'edit' ? 'Leave empty to keep current password' : 'At least 6 characters'}
                {...register('password')}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <LinkIcon />
                Role
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                {...register('role')}
              >
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <span className="font-semibold text-gray-900">Active Status</span>
                <p className="text-sm text-gray-500">
                  {isActiveVal ? 'User can login' : 'User disabled'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" {...register('is_active')} />
                <div className={`w-14 h-8 rounded-full transition-all duration-300 ${isActiveVal ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gray-300'}`}>
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${isActiveVal ? 'translate-x-6' : 'translate-x-0'}`}>
                    {isActiveVal && <CheckIcon />}
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:from-primary hover:to-secondary shadow-lg"
            >
              {mode === 'edit' ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
          {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.98); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
    
  );
  
}
