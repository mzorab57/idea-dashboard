import { useUsersQuery } from '../features/users/useUsersQuery';
import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { deleteUser } from '../services/admin';
import UsersModal from '../components/shared/UsersModal';
import { toast } from 'react-toastify';

// Icons
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

const UserIcon = () => (
  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ExclamationIcon = () => (
  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// Enhanced Delete Modal
function DeleteConfirmModal({ open, onClose, onConfirm, itemName }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp">
        <div className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <ExclamationIcon />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete User</h3>
          <p className="text-gray-600 mb-8">
            Are you sure you want to delete <span className="font-semibold text-gray-900">{itemName}</span>? 
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
              Delete User
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
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
            <div className="h-3 bg-gray-100 rounded-lg w-1/4" />
          </div>
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
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
        <UserIcon />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">No users found</h3>
      <p className="text-gray-500">
        {q ? 'Try a different search term' : 'Get started by adding your first user'}
      </p>
      {!q && (
        <button
          onClick={onAdd}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:from-secondary hover:to-primary shadow-lg transition-all"
        >
          <PlusIcon />
          Add User
        </button>
      )}
    </div>
  );
}

function UsersList() {
  const { data, isLoading } = useUsersQuery();
  const [q, setQ] = useState('');
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const items = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!q) return data;
    const v = q.toLowerCase();
    return data.filter((u) => 
      (u.full_name || '').toLowerCase().includes(v) || 
      (u.email || '').toLowerCase().includes(v)
    );
  }, [data, q]);

  const onDelete = async () => {
    if (!deleteModal.item) return;
    try {
      await deleteUser(deleteModal.item.id);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err?.message || 'Delete failed');
    } finally {
      setDeleteModal({ open: false, item: null });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              User Management
            </h1>
            <p className="text-gray-500 mt-1">Manage your team members and their permissions</p>
          </div>
          <button 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:from-secondary hover:to-primary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => { setEditItem(null); setModalOpen(true); }}
          >
            <PlusIcon />
            Add User
          </button>
        </div>

        {/* Search Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input 
              className="w-full pl-11 pr-4 py-3 bg-gray-50/80 border-2 border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200" 
              placeholder="Search by name or email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
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
                        User
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Role
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
                    {items.map((u, index) => (
                      <tr 
                        key={u.id} 
                        className="group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                              {u.full_name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-secondary transition-colors">
                                {u.full_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold uppercase ${
                            u.role === 'admin' 
                              ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 ring-1 ring-purple-500/20' 
                              : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 ring-1 ring-blue-500/20'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                            u.is_active 
                              ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 ring-1 ring-emerald-500/20' 
                              : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 ring-1 ring-gray-300/50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-secondary hover:shadow-lg hover:shadow-primary/20 transform hover:scale-105 transition-all duration-200" 
                              onClick={() => { setEditItem(u); setModalOpen(true); }}
                              title="Edit"
                            >
                              <EditIcon />
                            </button>
                            <button 
                              className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 hover:shadow-lg hover:shadow-red-500/20 transform hover:scale-105 transition-all duration-200" 
                              onClick={() => setDeleteModal({ open: true, item: u })}
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
            </>
          )}
        </div>

        {/* Modals */}
        <UsersModal
          open={modalOpen}
          mode={editItem ? 'edit' : 'create'}
          initial={editItem || undefined}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
          }}
        />
        
        <DeleteConfirmModal
          open={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, item: null })}
          onConfirm={onDelete}
          itemName={deleteModal.item?.full_name}
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

export default UsersList;