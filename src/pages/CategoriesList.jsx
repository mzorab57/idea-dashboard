import { useSearchParams } from 'react-router-dom';
import { useCategoriesQuery } from '../features/categories/useCategoriesQuery';
import { useMemo, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '../services/admin';
import CategoryModal from '../components/shared/CategoryModal';
import { toast } from 'react-toastify';

// Icons Components
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

// Delete Confirmation Modal
function DeleteConfirmModal({ open, onClose, onConfirm, itemName }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Category</h3>
          <p className="text-gray-500 mb-6">
            Are you sure you want to delete <span className="font-semibold text-gray-700">"{itemName}"</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 transition-all duration-200"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function TableSkeleton() {
  return (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-100">
          <div className="w-10 h-10 bg-gray-200 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
            <div className="h-3 bg-gray-100 rounded-lg w-1/4" />
          </div>
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 rounded-lg" />
            <div className="h-8 w-8 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty State
function EmptyState({ onAdd }) {
  return (
    <div className="text-center py-16">
      <FolderIcon />
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900">No categories found</h3>
        <p className="text-gray-500 mt-1">Get started by creating a new category.</p>
      </div>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl hover:from-secondary hover:to-primary shadow-lg shadow-primary/30 transition-all duration-200"
      >
        <PlusIcon />
        Add Category
      </button>
    </div>
  );
}

function CategoriesList() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get('page') || 1);
  const limit = Number(sp.get('limit') || 20);
  const q = sp.get('q') || '';
  const active = sp.get('active') ?? '';
  const params = useMemo(() => ({ 
    page, limit, q: q || undefined, 
    active: active !== '' ? Number(active) : undefined 
  }), [page, limit, q, active]);
  
  const { data, isLoading } = useCategoriesQuery(params);
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  useEffect(() => {
    if (!sp.get('page')) setSp((p) => { 
      p.set('page', '1'); 
      p.set('limit', '20'); 
      return p; 
    }, { replace: true });
  }, [sp, setSp]);

  const onSearch = (e) => setSp((p) => { 
    p.set('q', e.target.value); 
    p.set('page', '1'); 
    return p; 
  });
  
  const onActive = (e) => setSp((p) => { 
    const v = e.target.value; 
    if (v === '') p.delete('active'); 
    else p.set('active', v); 
    p.set('page', '1'); 
    return p; 
  });
  
  const next = () => setSp((p) => { 
    p.set('page', String(page + 1)); 
    return p; 
  });
  
  const prev = () => setSp((p) => { 
    p.set('page', String(Math.max(1, page - 1))); 
    return p; 
  });
  
  const handleDeleteClick = (item) => {
    setDeleteModal({ open: true, item });
  };
  
  const onDelete = async () => {
    if (!deleteModal.item) return;
    await deleteCategory(deleteModal.item.id);
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    toast.success('Category deleted successfully');
    setDeleteModal({ open: false, item: null });
  };

  const itemsBase = Array.isArray(data) ? data : (data?.categories || data?.items || []);
  const items = useMemo(() => {
    const v = (q || '').toLowerCase();
    return itemsBase.filter((c) => {
      const matchesText =
        !v ||
        (c.name || '').toLowerCase().includes(v) ||
        (c.slug || '').toLowerCase().includes(v) ||
        (c.description || '').toLowerCase().includes(v);
      const matchesActive = active === '' || Number(c.is_active) === Number(active);
      return matchesText && matchesActive;
    });
  }, [itemsBase, q, active]);

  const totalPages = data?.totalPages || Math.ceil((data?.total || items.length) / limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Categories
            </h1>
            <p className="text-gray-500 mt-1">Manage your product categories</p>
          </div>
          <button 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl hover:from-secondary hover:to-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => { setEditItem(null); setModalOpen(true); }}
          >
            <PlusIcon />
            Add Category
          </button>
        </div>

        {/* Filters Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <SearchIcon />
              </div>
              <input 
                className="w-full pl-12 pr-4 py-3 bg-gray-50/80  rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200" 
                placeholder="Search categories..." 
                defaultValue={q} 
                onChange={onSearch} 
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <FilterIcon />
              </div>
              <select 
                className="pl-12 pr-10 py-3 bg-gray-50/80 border-2 border-transparent rounded-xl text-gray-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer min-w-[160px]" 
                defaultValue={active} 
                onChange={onActive}
              >
                <option value="">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          {isLoading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <EmptyState onAdd={() => { setEditItem(null); setModalOpen(true); }} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((c, index) => (
                      <tr 
                        key={c.id} 
                        className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                              {c.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-secondary transition-colors">
                                {c.name}
                              </div>
                              {c.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {c.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600 font-mono">
                            {c.slug}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            c.is_active 
                              ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 ring-1 ring-emerald-500/20' 
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 ring-1 ring-gray-300/50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${c.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                            {c.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-secondary hover:shadow-lg hover:shadow-primary/20 transform hover:scale-105 transition-all duration-200" 
                              onClick={() => { setEditItem(c); setModalOpen(true); }}
                              title="Edit"
                            >
                              <EditIcon />
                            </button>
                            <button 
                              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 hover:shadow-lg hover:shadow-red-500/20 transform hover:scale-105 transition-all duration-200" 
                              onClick={() => handleDeleteClick(c)}
                              title="Delete"
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-semibold text-gray-700">{items.length}</span> categories
                    {totalPages > 1 && (
                      <span> • Page <span className="font-semibold text-gray-700">{page}</span> of <span className="font-semibold text-gray-700">{totalPages}</span></span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-primary hover:text-secondary hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:hover:bg-transparent transition-all duration-200" 
                      onClick={prev} 
                      disabled={page <= 1}
                    >
                      <ChevronLeftIcon />
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setSp((p) => { p.set('page', String(pageNum)); return p; })}
                            className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                              page === pageNum
                                ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button 
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-primary hover:text-secondary hover:bg-indigo-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:hover:bg-transparent transition-all duration-200" 
                      onClick={next} 
                      disabled={(items.length || 0) < limit}
                    >
                      Next
                      <ChevronRightIcon />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <CategoryModal
        open={modalOpen}
        mode={editItem ? 'edit' : 'create'}
        initial={editItem || undefined}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
        }}
      />
      
      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={onDelete}
        itemName={deleteModal.item?.name}
      />

      {/* Add custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default CategoriesList;
