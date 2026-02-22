import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateAdminSettings } from '../../services/admin';
import { toast } from 'react-toastify';

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const GearIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317a1 1 0 011.35 0l.836.7a1 1 0 001.21.06l.98-.653a1 1 0 011.39.36l.5.866a1 1 0 00.98.5l1.148-.094a1 1 0 011.05.79l.2 1.13a1 1 0 00.71.78l1.078.312a1 1 0 01.69 1.23l-.312 1.08a1 1 0 00.78 1.3l1.13.2a1 1 0 01.79 1.05l-.094 1.15a1 1 0 00.5.98l.866.5a1 1 0 01.36 1.39l-.653.98a1 1 0 00.06 1.21l.7.835a1 1 0 010 1.35l-.7.836a1 1 0 00-.06 1.21l.653.98a1 1 0 01-.36 1.39l-.866.5a1 1 0 00-.5.98l.094 1.148a1 1 0 01-.79 1.05l-1.13.2a1 1 0 00-.78.71l-.312 1.079a1 1 0 01-1.23.69l-1.08-.312a1 1 0 00-1.3.78l-.2 1.13a1 1 0 01-1.05.79l-1.148-.094a1 1 0 00-.98.5l-.5.866a1 1 0 01-1.39.36l-.98-.653a1 1 0 00-1.21.06l-.836.7a1 1 0 01-1.35 0l-.836-.7a1 1 0 00-1.21-.06l-.98.653a1 1 0 01-1.39-.36l-.5-.866a1 1 0 00-.98-.5l-1.148.094a1 1 0 01-1.05-.79l-.2-1.13a1 1 0 00-.71-.78l-1.079-.312a1 1 0 01-.69-1.23l.312-1.08a1 1 0 00-.78-1.3l-1.13-.2a1 1 0 01-.79-1.05l.094-1.15a1 1 0 00-.5-.98l-.866-.5a1 1 0 01-.36-1.39l.653-.98a1 1 0 00-.06-1.21l-.7-.835a1 1 0 010-1.35l.7-.836a1 1 0 00.06-1.21l-.653-.98a1 1 0 01.36-1.39l.866-.5a1 1 0 00.5-.98l-.094-1.148a1 1 0 01.79-1.05l1.13-.2a1 1 0 00.78-.71l.312-1.079a1 1 0 011.23-.69l1.08.312a1 1 0 001.3-.78l.2-1.13a1 1 0 011.05-.79l1.148.094a1 1 0 00.98-.5l.5-.866a1 1 0 011.39-.36l.98.653a1 1 0 001.21-.06l.836-.7zM12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

const schema = z.object({
  setting_key: z.string().min(1, 'Key is required'),
  setting_value: z.string().min(1, 'Value is required'),
});

export default function SettingsModal({ open, mode = 'create', initial, onClose, onSuccess }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { setting_key: '', setting_value: '' },
  });

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initial) {
      reset({
        setting_key: initial.setting_key || '',
        setting_value: initial.setting_value || '',
      });
    } else {
      reset({ setting_key: '', setting_value: '' });
    }
  }, [open, mode, initial, reset]);

  const onSubmit = async (values) => {
    const payload = {
      key: values.setting_key,
      value: values.setting_value,
    };
    try {
      await updateAdminSettings(payload);
      toast.success(mode === 'edit' ? 'Setting updated' : 'Setting created');
      onClose?.();
      onSuccess?.();
    } catch (err) {
      toast.error(err?.message || 'Action failed');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-slideUp overflow-hidden">
        <div className="relative px-6 py-5 bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
              <GearIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'edit' ? 'Edit Setting' : 'New Setting'}
              </h2>
              <p className="text-sm text-orange-100">
                {mode === 'edit' ? 'Update setting details' : 'Create a new setting'}
              </p>
            </div>
          </div>
          <button
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 backdrop-blur text-white hover:bg-white/30 flex items-center justify-center transition-all duration-200"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <GearIcon />
              Key
            </label>
            <input
              className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 ${
                errors.setting_key ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-transparent'
              }`}
              placeholder="e.g. site_name"
              {...register('setting_key')}
              disabled={mode === 'edit'}
            />
            {errors.setting_key && (
              <p className="flex items-center gap-1 text-red-500 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.setting_key.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <GearIcon />
              Value
            </label>
            <input
              className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 ${
                errors.setting_value ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-transparent'
              }`}
              placeholder="Enter value..."
              {...register('setting_value')}
            />
            {errors.setting_value && (
              <p className="flex items-center gap-1 text-red-500 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.setting_value.message}
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:from-secondary hover:to-orange-700 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (mode === 'edit' ? 'Saving...' : 'Creating...') : (mode === 'edit' ? 'Save Changes' : 'Create Setting')}
            </button>
          </div>
        </form>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
          .animate-slideUp { animation: slideUp 0.3s ease-out; }
        `}</style>
      </div>
    </div>
  );
}
