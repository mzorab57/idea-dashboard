import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { createHeroBanner, getStorageUrl, updateHeroBanner, uploadStorage } from '../../services/admin';

const schema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  sort_order: z.coerce.number().int().min(0, 'Sort order must be 0 or more'),
  is_active: z.boolean().optional(),
});

export default function BannerModal({ open, mode = 'create', initial, onClose, onSuccess }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      subtitle: '',
      sort_order: 0,
      is_active: true,
    },
  });

  const [imageKey, setImageKey] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initial) {
      reset({
        title: initial.title || '',
        subtitle: initial.subtitle || '',
        sort_order: Number(initial.sort_order ?? 0),
        is_active: !!initial.is_active,
      });
      setImageKey(initial.image || '');
      if (initial.image) {
        (async () => {
          try {
            const res = await getStorageUrl(initial.image);
            setImagePreview(res?.url || '');
          } catch {
            setImagePreview('');
          }
        })();
      } else {
        setImagePreview('');
      }
    } else {
      reset({
        title: '',
        subtitle: '',
        sort_order: 0,
        is_active: true,
      });
      setImageKey('');
      setImagePreview('');
    }
  }, [open, mode, initial, reset]);

  const handleFile = async (file) => {
    if (!file) return;

    setUploading(true);
    try {
      const upload = await uploadStorage(file, 'banners');
      setImageKey(upload.key);
      const urlRes = await getStorageUrl(upload.key);
      setImagePreview(urlRes?.url || '');
      toast.success('Banner image uploaded');
    } catch (err) {
      toast.error(err?.message || 'Failed to upload banner image');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values) => {
    if (!imageKey) {
      toast.error('Banner image is required');
      return;
    }

    const payload = {
      title: (values.title || '').trim() || null,
      subtitle: (values.subtitle || '').trim() || null,
      image: imageKey,
      sort_order: Number(values.sort_order ?? 0),
      is_active: values.is_active ? 1 : 0,
    };

    try {
      if (mode === 'edit' && initial?.id) {
        await updateHeroBanner(initial.id, payload);
        toast.success('Banner updated');
      } else {
        await createHeroBanner(payload);
        toast.success('Banner created');
      }

      onClose?.();
      onSuccess?.();
    } catch (err) {
      toast.error(err?.message || 'Banner action failed');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'edit' ? 'Edit Hero Banner' : 'New Hero Banner'}
              </h2>
              <p className="text-sm text-orange-100">
                Manage the images that appear in the website hero slider.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 text-white hover:bg-white/25"
              onClick={onClose}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Title</label>
              <input
                className="w-full rounded-xl border-2 border-transparent bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                placeholder="Optional title"
                {...register('title')}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Sort Order</label>
              <input
                type="number"
                min="0"
                className="w-full rounded-xl border-2 border-transparent bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                {...register('sort_order')}
              />
              {errors.sort_order && <p className="text-sm text-red-500">{errors.sort_order.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Subtitle</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border-2 border-transparent bg-gray-50 px-4 py-3 text-gray-900 outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
              placeholder="Optional subtitle"
              {...register('subtitle')}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-gray-700">Banner Image</label>
              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" {...register('is_active')} />
                Active
              </label>
            </div>

            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4">
              {imagePreview ? (
                <div className="space-y-4">
                  <img src={imagePreview} alt="Banner preview" className="h-48 w-full rounded-xl object-cover" />
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change image
                    </button>
                    <button
                      type="button"
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                      onClick={() => {
                        setImageKey('');
                        setImagePreview('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500 hover:border-primary/50 hover:text-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold">{uploading ? 'Uploading...' : 'Upload banner image'}</span>
                  <span className="text-xs text-gray-400">Recommended wide image for the hero slider.</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          </div>

          <div className="flex gap-3 border-t border-gray-100 pt-5">
            <button
              type="button"
              className="flex-1 rounded-xl border-2 border-gray-200 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Save Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
