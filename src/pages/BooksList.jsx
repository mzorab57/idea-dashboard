import { useSearchParams } from 'react-router-dom';
import { useBooksQuery } from '../features/books/useBooksQuery';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { deleteBook, getAdminCategories, getStorageUrl } from '../services/admin';
import BooksModal from '../components/shared/BooksModal';
import { toast } from 'react-toastify';
import { Search, Plus, Download, Edit, Eye, Trash2, Filter, ChevronLeft, ChevronRight, BookOpen, Image } from 'lucide-react';


// Icons
const SearchIcon = () => <Search className="w-5 h-5" />;
const PlusIcon = () => <Plus className="w-5 h-5" />;
const EditIcon = () => <Edit className="w-4 h-4" />;
const TrashIcon = () => <Trash2 className="w-4 h-4" />;
const FilterIcon = () => <Filter className="w-5 h-5" />;
const ChevronLeftIcon = () => <ChevronLeft className="w-5 h-5" />;
const ChevronRightIcon = () => <ChevronRight className="w-5 h-5" />;
const BookIcon = () => <BookOpen className="w-16 h-16 text-gray-300" />;

// Enhanced Delete Modal
function DeleteConfirmModal({ open, onClose, onConfirm, itemName }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Book</h3>
          <p className="text-gray-600 mb-8">
            Are you sure you want to delete <span className="font-semibold text-gray-900">"{itemName}"</span>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 shadow-lg transition-all"
            >
              Delete Book
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
    <div className="divide-y divide-gray-100">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
          <div className="w-16 h-20 bg-gray-200 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
            <div className="h-3 bg-gray-100 rounded-lg w-1/4" />
          </div>
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="flex gap-2">
            <div className="h-9 w-9 bg-gray-200 rounded-lg" />
            <div className="h-9 w-9 bg-gray-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Empty State
function EmptyState({ onAdd, q }) {
  return (
    <div className="text-center py-16">
      <div className="flex justify-center mb-4">
        <BookIcon />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">
        {q ? 'No books found' : 'No books yet'}
      </h3>
      <p className="text-gray-500 mb-6">
        {q ? 'Try a different search term' : 'Get started by adding your first book'}
      </p>
      {!q && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:from-secondary hover:to-primary shadow-lg transition-all"
        >
          <PlusIcon />
          Add Book
        </button>
      )}
    </div>
  );
}

function BooksList() {
  const [sp, setSp] = useSearchParams();
  const page = Number(sp.get('page') || 1);
  const limit = Number(sp.get('limit') || 20);
  const q = sp.get('q') || '';
  const active = sp.get('active') ?? '';
  const categoryId = sp.get('category_id') || '';
  const featured = sp.get('featured') ?? '';
  
  const params = useMemo(() => ({
    page,
    limit,
    q: q || undefined,
    active: active !== '' ? Number(active) : undefined,
    category_id: categoryId !== '' ? Number(categoryId) : undefined,
    featured: featured !== '' ? Number(featured) : undefined,
  }), [page, limit, q, active, categoryId, featured]);
  
  const { data, isLoading } = useBooksQuery(params);
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
  const [thumbURLs, setThumbURLs] = useState({});

  useEffect(() => {
    if (!sp.get('page')) setSp((p) => { 
      p.set('page', '1'); 
      p.set('limit', '20'); 
      return p; 
    }, { replace: true });
  }, [sp, setSp]);

  useEffect(() => {
    (async () => {
      const data = await getAdminCategories();
      setCategories(Array.isArray(data) ? data : (data?.categories ?? (data?.items ?? [])));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const list = Array.isArray(data?.items) ? data.items : [];
      const keys = list.map((b) => b.thumbnail).filter(Boolean);
      if (keys.length === 0) { setThumbURLs({}); return; }
      const entries = await Promise.all(keys.map(async (k) => {
        try {
          const d = await getStorageUrl(k);
          return [k, d.url];
        } catch {
          return [k, ''];
        }
      }));
      const map = {};
      entries.forEach(([k, u]) => { map[k] = u; });
      setThumbURLs(map);
    })();
  }, [data]);

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
  
  const onCategory = (e) => setSp((p) => { 
    const v = e.target.value; 
    if (v === '') p.delete('category_id'); 
    else p.set('category_id', v); 
    p.set('page', '1'); 
    return p; 
  });
  
  const onFeatured = (e) => setSp((p) => { 
    const v = e.target.value; 
    if (v === '') p.delete('featured'); 
    else p.set('featured', v); 
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
  
  const onDelete = async () => {
    if (!deleteModal.item) return;
    try {
      await deleteBook(deleteModal.item.id);
      queryClient.invalidateQueries({ queryKey: ['admin-books'] });
      toast.success('Book deleted successfully');
    } catch (err) {
      toast.error(err?.message || 'Delete failed');
    } finally {
      setDeleteModal({ open: false, item: null });
    }
  };

  const itemsBase = (data?.items || []);
  const items = useMemo(() => {
    const v = (q || '').toLowerCase();
    return itemsBase.filter((b) => {
      const applyText = v.length >= 2;
      const matchesText =
        !applyText ||
        (b.title || '').toLowerCase().includes(v) ||
        (b.author_names || '').toLowerCase().includes(v) ||
        (b.category_name || '').toLowerCase().includes(v) ||
        (b.subcategory_name || '').toLowerCase().includes(v);
      const matchesActive = active === '' || Number(b.is_active) === Number(active);
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
              Book Management
            </h1>
            <p className="text-gray-500 mt-1">Manage your digital library collection</p>
          </div>
          <button 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:from-secondary hover:to-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => { setEditItem(null); setModalOpen(true); }}
          >
            <PlusIcon />
            Add Book
          </button>
        </div>

        {/* Filters Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute focus:outline-none fou inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <SearchIcon />
              </div>
              <input 
                className="w-full focus:outline-none pl-12 pr-4 py-3 bg-gray-50/80 border-2 border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200" 
                placeholder="Search books, authors, categories..." 
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
                className="pl-12 pr-10 py-3 bg-gray-50/80 border-2 border-transparent rounded-xl text-gray-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer min-w-[140px]" 
                defaultValue={active} 
                onChange={onActive}
              >
                <option value="">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <FilterIcon />
              </div>
              <select 
                className="pl-12 pr-10 py-3 bg-gray-50/80 border-2 border-transparent rounded-xl text-gray-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer min-w-[180px]" 
                defaultValue={categoryId} 
                onChange={onCategory}
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Featured Filter */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <FilterIcon />
              </div>
              <select 
                className="pl-12 pr-10 py-3 bg-gray-50/80 border-2 border-transparent rounded-xl text-gray-900 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 appearance-none cursor-pointer min-w-[160px]" 
                defaultValue={featured} 
                onChange={onFeatured}
              >
                <option value="">All Books</option>
                <option value="1">Featured</option>
                <option value="0">Not Featured</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          {isLoading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <EmptyState onAdd={() => { setEditItem(null); setModalOpen(true); }} q={q} />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Cover
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Book Info
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Authors
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Metrics
                      </th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((b, index) => (
                      <tr 
                        key={b.id} 
                        className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          {(() => {
                            const url = b.thumbnail ? thumbURLs[b.thumbnail] : null;
                            if (url) {
                              return (
                                <img
                                  src={url}
                                  alt={b.title}
                                  className="w-16 h-20 object-cover rounded-xl shadow-md transition-transform group-hover:scale-105"
                                  onError={(e) => { 
                                    e.currentTarget.style.display = 'none'; 
                                    e.currentTarget.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              );
                            }
                            return null;
                          })()}
                          <div className={`w-16 h-20 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 ${b.thumbnail && thumbURLs[b.thumbnail] ? 'hidden' : 'flex'} items-center justify-center`}>
                            <Image className="w-8 h-8 text-gray-400" />
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 group-hover:text-secondary transition-colors">
                            {b.title}
                          </div>
                          {Boolean(Number(b.is_featured)) && (
                            <span className="mt-2 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-sm">
                              Featured
                            </span>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 text-gray-600">{b.author_names || '—'}</td>
                        
                        <td className="px-6 py-4">
                          <div className="text-gray-600">{b.category_name || '—'}</div>
                          {b.subcategory_name && (
                            <div className="text-xs text-gray-400 mt-1">{b.subcategory_name}</div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            b.is_active 
                              ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 ring-1 ring-emerald-500/20' 
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 ring-1 ring-gray-300/50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${b.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                            {b.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="text-sm font-medium text-gray-700">
                              <Eye className="w-4 h-4 inline-block mr-1" /> {b.view_count ?? 0} views
                            </div>
                            <div className="text-sm font-medium text-gray-700">
                              <Download className="w-4 h-4 inline-block mr-1" /> {b.download_count ?? 0} downloads
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-secondary hover:shadow-lg hover:shadow-primary/20 transform hover:scale-105 transition-all duration-200" 
                              onClick={() => { setEditItem(b); setModalOpen(true); }}
                              title="Edit"
                            >
                              <EditIcon />
                            </button>
                            <button 
                              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 hover:shadow-lg hover:shadow-red-500/20 transform hover:scale-105 transition-all duration-200" 
                              onClick={() => setDeleteModal({ open: true, item: b })}
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
                    Showing <span className="font-semibold text-gray-700">{items.length}</span> books
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

        {/* Modals */}
        <BooksModal
          open={modalOpen}
          mode={editItem ? 'edit' : 'create'}
          initial={editItem || undefined}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { queryClient.invalidateQueries({ queryKey: ['admin-books'] }); }}
        />
        
        <DeleteConfirmModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, item: null })}
          onConfirm={onDelete}
          itemName={deleteModal.item?.title}
        />

        {/* Animations */}
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

export default BooksList;
