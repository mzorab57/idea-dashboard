import { useSearchParams } from 'react-router-dom';
import { useAuthorsQuery } from '../features/authors/useAuthorsQuery';
import { useMemo, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { deleteAuthor } from '../services/admin';
import AuthorModal from '../components/shared/AuthorModal';
import { toast } from 'react-toastify';
import { getStorageUrl as getStorageUrlApi } from '../services/admin';

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

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

// Storage URL helper
const getStorageUrl = (key) => {
  if (!key) return null;
  if (key.startsWith('http')) return key;
  const base = import.meta.env.VITE_API_BASE_URL || '';
  return `${base}/api/admin/storage/view?key=${encodeURIComponent(key)}`;
};

// Delete Confirmation Modal
function DeleteConfirmModal({ open, onClose, onConfirm, itemName, itemImage }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scaleIn overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden ring-4 ring-red-100">
            {itemImage ? (
              <img src={getStorageUrl(itemImage)} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-red-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Author</h3>
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
          <div className="w-14 h-14 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
            <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
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
      <div className="flex justify-center">
        <UsersIcon />
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-900">No authors found</h3>
        <p className="text-gray-500 mt-1">Get started by adding a new author.</p>
      </div>
      <button
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl hover:from-primary hover:to-pink-700 shadow-lg shadow-primary/30 transition-all duration-200"
      >
        <PlusIcon />
        Add Author
      </button>
    </div>
  );
}

function AuthorsList() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get('page') || 1);
  const limit = Number(sp.get('limit') || 20);
  const q = sp.get('q') || '';
  const active = sp.get('active') ?? '';
  const params = useMemo(() => ({ 
    page, limit, q: q || undefined, 
    active: active !== '' ? Number(active) : undefined 
  }), [page, limit, q, active]);
  
  const { data, isLoading } = useAuthorsQuery(params);
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
  const [imageUrls, setImageUrls] = useState({});

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
    await deleteAuthor(deleteModal.item.id);
    queryClient.invalidateQueries({ queryKey: ['admin-authors'] });
    toast.success('Author deleted successfully');
    setDeleteModal({ open: false, item: null });
  };

  const itemsBase = Array.isArray(data) ? data : (data?.items || []);
  const items = useMemo(() => {
    const v = (q || '').toLowerCase();
    return itemsBase.filter((a) => {
      const matchesText =
        !v ||
        (a.name || '').toLowerCase().includes(v) ||
        (a.slug || '').toLowerCase().includes(v) ||
        (a.bio || '').toLowerCase().includes(v);
      const matchesActive = active === '' || Number(a.is_active) === Number(active);
      return matchesText && matchesActive;
    });
  }, [itemsBase, q, active]);

  const totalPages = data?.totalPages || Math.ceil((data?.total || items.length) / limit);

  useEffect(() => {
    const loadUrls = async () => {
      const needed = [];
      for (const a of items) {
        const k = a.image;
        if (!k) continue;
        if (k.startsWith?.('http')) {
          if (!imageUrls[k]) {
            needed.push({ key: k, direct: true });
          }
        } else {
          if (!imageUrls[k]) {
            needed.push({ key: k, direct: false });
          }
        }
      }
      if (needed.length === 0) return;
      const updates = {};
      await Promise.all(
        needed.map(async (it) => {
          try {
            if (it.direct) {
              updates[it.key] = it.key;
            } else {
              const res = await getStorageUrlApi(it.key);
              updates[it.key] = res?.url || getStorageUrl(it.key);
            }
          } catch {
            updates[it.key] = getStorageUrl(it.key);
          }
        })
      );
      setImageUrls((prev) => ({ ...prev, ...updates }));
    };
    loadUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-p-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Authors
            </h1>
            <p className="text-gray-500 mt-1">Manage your content authors</p>
          </div>
          <button 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl hover:from-primary hover:to-secondary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => { setEditItem(null); setModalOpen(true); }}
          >
            <PlusIcon />
            Add Author
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
                className="w-full pl-12 pr-4 py-3 bg-gray-50/80 border-2 border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200" 
                placeholder="Search authors by name, bio..." 
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
                        Author
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Bio
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
                    {items.map((a, index) => (
                      <tr 
                        key={a.id} 
                        className="group hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              {a.image && (imageUrls[a.image] || a.image?.startsWith?.('http')) ? (
                                <img
                                  src={imageUrls[a.image] || a.image}
                                  alt={a.name}
                                  className="w-14 h-14 rounded-full object-cover ring-4 ring-white shadow-lg group-hover:ring-primary-100 transition-all duration-200"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl ring-4 ring-white shadow-lg group-hover:ring-p-100 transition-all duration-200">
                                  {a.name?.charAt(0)?.toUpperCase()}
                                </div>
                              )}
                              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${a.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                {a.name}
                              </div>
                              <div className="text-sm text-gray-400">
                                Author
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <code className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-600 font-mono">
                            {a.slug}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {a.bio || <span className="text-gray-400 italic">No bio</span>}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            a.is_active 
                              ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 ring-1 ring-emerald-500/20' 
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 ring-1 ring-gray-300/50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${a.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                            {a.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-p-100 hover:text-primary hover:shadow-lg hover:shadow-primary/20 transform hover:scale-105 transition-all duration-200" 
                              onClick={() => { setEditItem(a); setModalOpen(true); }}
                              title="Edit"
                            >
                              <EditIcon />
                            </button>
                            <button 
                              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 hover:shadow-lg hover:shadow-red-500/20 transform hover:scale-105 transition-all duration-200" 
                              onClick={() => handleDeleteClick(a)}
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
                    Showing <span className="font-semibold text-gray-700">{items.length}</span> authors
                    {totalPages > 1 && (
                      <span> • Page <span className="font-semibold text-gray-700">{page}</span> of <span className="font-semibold text-gray-700">{totalPages}</span></span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-primary hover:text-primary hover:bg-p-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:hover:bg-transparent transition-all duration-200" 
                      onClick={prev} 
                      disabled={page <= 1}
                    >
                      <ChevronLeftIcon />
                      Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="hidden sm:flex items-center gap-1">
                      {[...Array(Math.min(5, totalPages || 1))].map((_, i) => {
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
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:border-primary hover:text-primary hover:bg-p-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:hover:bg-transparent transition-all duration-200" 
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
      <AuthorModal
        open={modalOpen}
        mode={editItem ? 'edit' : 'create'}
        initial={editItem || undefined}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-authors'] });
        }}
      />
      
      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={onDelete}
        itemName={deleteModal.item?.name}
        itemImage={deleteModal.item?.image}
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

export default AuthorsList;
