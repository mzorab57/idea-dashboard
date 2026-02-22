import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAuthor, updateAuthor, uploadStorage, getStorageUrl } from '../../services/admin';
import { slugify } from '../../utils/slugify';
import { toast } from 'react-toastify';

// Icons
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

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ImageIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);


const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  bio: z.string().optional(),
  is_active: z.boolean().optional(),
});

export default function AuthorModal({ open, mode = 'create', initial, onClose, onSuccess }) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', bio: '', is_active: true },
  });
  
  const [slugTouched, setSlugTouched] = useState(false);
  const [imageKey, setImageKey] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  const nameVal = watch('name');
  const isActiveVal = watch('is_active');

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initial) {
      reset({
        name: initial.name || '',
        slug: initial.slug || '',
        bio: initial.bio || '',
        is_active: !!initial.is_active,
      });
      setImageKey(initial.image || '');
      if (initial.image) {
        (async () => {
          try {
            const res = await getStorageUrl(initial.image);
            setImagePreview(res.url || '');
          } catch {
            setImagePreview('');
          }
        })();
      } else {
        setImagePreview('');
      }
      setSlugTouched(true);
    } else {
      reset({ name: '', slug: '', bio: '', is_active: true });
      setImageKey('');
      setImagePreview('');
      setSlugTouched(false);
    }
  }, [open, mode, initial, reset]);

  useEffect(() => {
    if (mode === 'create' && !slugTouched) {
      setValue('slug', slugify(nameVal || ''));
    }
  }, [nameVal, mode, slugTouched, setValue]);

  const handleFile = async (file) => {
    if (!file) return;
    
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Upload
    setUploading(true);
    try {
      const res = await uploadStorage(file, 'thumbnails');
      setImageKey(res.key);
      const urlRes = await getStorageUrl(res.key);
      setImagePreview(urlRes.url || '');
      toast.success('Image uploaded successfully');
    } catch {
      toast.error('Failed to upload image');
      setImagePreview('');
    } finally {
      setUploading(false);
    }
  };

  const onUploadImage = async (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImageKey('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      slug: values.slug ? values.slug : slugify(values.name),
      bio: values.bio || null,
      image: imageKey || null,
      is_active: values.is_active ? 1 : 0,
    };
    try {
      if (mode === 'edit' && initial?.id) {
        await updateAuthor(initial.id, payload);
        toast.success('Author updated successfully!');
      } else {
        await createAuthor(payload);
        toast.success('Author created successfully!');
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0  bg-black/60 backdrop-blur-sm animate-fadeIn" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-slideUp overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10  px-6 py-5 bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
              <UserIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'edit' ? 'Edit Author' : 'New Author'}
              </h2>
              <p className="text-sm text-rose-100">
                {mode === 'edit' ? 'Update author details' : 'Add a new author'}
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
        
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <ImageIcon className="w-5 h-5" />
              Profile Image
            </label>
            
            {imagePreview ? (
              <div className="relative w-32 h-32 mx-auto">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-full rounded-full object-cover ring-4 ring-rose-100 shadow-xl"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <SpinnerIcon />
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg transition-all duration-200"
                >
                  <TrashIcon />
                </button>
              </div>
            ) : (
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                  dragActive 
                    ? 'border-primary bg-rose-50' 
                    : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={onUploadImage}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                    dragActive ? 'bg-primary text-white' : 'bg-rose-100 text-primary'
                  }`}>
                    {uploading ? <SpinnerIcon /> : <UploadIcon />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">
                      {uploading ? 'Uploading...' : 'Drop image here or click to upload'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      JPG, PNG or WebP (max. 2MB)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <UserIcon />
              Author Name
            </label>
            <input 
              className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 ${
                errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-transparent'
              }`}
              placeholder="Enter author name..."
              {...register('name')} 
            />
            {errors.name && (
              <p className="flex items-center gap-1 text-red-500 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name.message}
              </p>
            )}
          </div>
          
          {/* Slug Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <LinkIcon />
              URL Slug
            </label>
            <input 
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:outline-none rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 font-mono text-sm"
              placeholder="author-slug"
              {...register('slug')} 
              onChange={(e) => {
                setSlugTouched(true);
                register('slug').onChange(e);
              }} 
            />
            <p className="text-xs text-gray-400">
              Auto-generated from name if left empty
            </p>
          </div>
          
          {/* Bio Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <DocumentIcon />
              Biography
              <span className="text-xs text-gray-400 font-normal">(Optional)</span>
            </label>
            <textarea 
              className="w-full px-4 py-3 focus:outline-none bg-gray-50 border-2 border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none h-28"
              placeholder="Brief biography of the author..."
              {...register('bio')} 
            />
          </div>
          
          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <span className="font-semibold text-gray-900">Active Status</span>
              <p className="text-sm text-gray-500">
                {isActiveVal ? 'Author is visible on the website' : 'Author is hidden'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                {...register('is_active')} 
              />
              <div className={`w-14 h-8 rounded-full transition-all duration-300 peer-focus:ring-4 peer-focus:ring-primary/20 ${
                isActiveVal 
                  ? 'bg-gradient-to-r from-primary to-secondary' 
                  : 'bg-gray-300'
              }`}>
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${
                  isActiveVal ? 'translate-x-6' : 'translate-x-0'
                }`}>
                  {isActiveVal && <CheckIcon />}
                </div>
              </div>
            </label>
          </div>
          
          {/* Actions */}
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
              disabled={isSubmitting || uploading}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:from-primary hover:to-secondary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon />
                  {mode === 'edit' ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                mode === 'edit' ? 'Save Changes' : 'Create Author'
              )}
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
