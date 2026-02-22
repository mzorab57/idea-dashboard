import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSubcategory, updateSubcategory } from '../../services/admin';
import { slugify } from '../../utils/slugify';
import { toast } from 'react-toastify';

// Icons
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const LinkIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const CategoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const LayersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  is_active: z.boolean().optional(),
});

export default function SubcategoryModal({ open, mode = 'create', initial, categories = [], onClose, onSuccess }) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', slug: '', category_id: '', is_active: true },
  });
  
  const [slugTouched, setSlugTouched] = useState(false);
  const nameVal = watch('name');
  const isActiveVal = watch('is_active');
  const selectedCategoryId = watch('category_id');

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initial) {
      reset({
        name: initial.name || '',
        slug: initial.slug || '',
        category_id: initial.category_id ? String(initial.category_id) : '',
        is_active: !!initial.is_active,
      });
      setSlugTouched(true);
    } else {
      reset({ name: '', slug: '', category_id: '', is_active: true });
      setSlugTouched(false);
    }
  }, [open, mode, initial, reset]);

  useEffect(() => {
    if (mode === 'create' && !slugTouched) {
      setValue('slug', slugify(nameVal || ''));
    }
  }, [nameVal, mode, slugTouched, setValue]);

  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      slug: values.slug ? values.slug : slugify(values.name),
      category_id: Number(values.category_id),
      is_active: values.is_active ? 1 : 0,
    };
    try {
      if (mode === 'edit' && initial?.id) {
        await updateSubcategory(initial.id, payload);
        toast.success('Subcategory updated successfully!');
      } else {
        await createSubcategory(payload);
        toast.success('Subcategory created successfully!');
      }
      onClose?.();
      onSuccess?.();
    } catch (err) {
      toast.error(err?.message || 'Action failed');
    }
  };

  // Get selected category name
  const selectedCategory = categories.find(c => String(c.id) === selectedCategoryId);

  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-slideUp overflow-hidden">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
              <LayersIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'edit' ? 'Edit Subcategory' : 'New Subcategory'}
              </h2>
              <p className="text-sm text-teal-100">
                {mode === 'edit' ? 'Update subcategory details' : 'Create a new subcategory'}
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
          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <TagIcon />
              Subcategory Name
            </label>
            <input 
              className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 ${
                errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-transparent'
              }`}
              placeholder="Enter subcategory name..."
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
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 font-mono text-sm"
              placeholder="subcategory-slug"
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
          
          {/* Category Select Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <CategoryIcon />
              Parent Category
            </label>
            <div className="relative">
              <select 
                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer ${
                  errors.category_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-transparent'
                }`}
                {...register('category_id')}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <ChevronDownIcon />
              </div>
            </div>
            {selectedCategory && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-400">Selected:</span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-primary to-secondary text-white">
                  {selectedCategory.name}
                </span>
              </div>
            )}
            {errors.category_id && (
              <p className="flex items-center gap-1 text-red-500 text-sm">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.category_id.message}
              </p>
            )}
          </div>
          
          {/* Active Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <span className="font-semibold text-gray-900">Active Status</span>
              <p className="text-sm text-gray-500">
                {isActiveVal ? 'Subcategory is visible to customers' : 'Subcategory is hidden'}
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
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:from-primary/90 hover:to-secondary/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon />
                  {mode === 'edit' ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                mode === 'edit' ? 'Save Changes' : 'Create Subcategory'
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