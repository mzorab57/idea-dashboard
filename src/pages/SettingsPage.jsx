import { useEffect, useState, useMemo } from 'react';
import { getAdminSettings, deleteAdminSetting } from '../services/admin';
import SettingsModal from '../components/shared/SettingsModal';
import { toast } from 'react-toastify';

function SettingsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const load = async () => {
    setLoading(true);
    try {
      const list = await getAdminSettings();
      setItems(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!q) return items;
    const v = q.toLowerCase();
    return items.filter((i) => (i.setting_key || '').toLowerCase().includes(v) || (i.setting_value || '').toLowerCase().includes(v));
  }, [items, q]);

  const onDelete = async () => {
    if (!deleteModal.item) return;
    await deleteAdminSetting(deleteModal.item.setting_key);
    toast.success('Setting deleted');
    setDeleteModal({ open: false, item: null });
    load();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-p-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-500 mt-1">Manage site settings</p>
          </div>
          <button
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-medium rounded-xl hover:from-primary hover:to-secondary shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => { setEditItem(null); setModalOpen(true); }}
          >
            Add Setting
          </button>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6">
          <div className="flex gap-4">
            <input
              className="flex-1 pl-4 pr-4 hover:focus:outline-none py-3 bg-gray-50/80 border-2 border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
              placeholder="Search settings..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
          {loading ? (
            <div className="p-6">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-500">No settings found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Key</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((s) => (
                    <tr key={s.setting_key} className="group hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{s.setting_key}</div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 truncate max-w-xl">{s.setting_value || ''}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-p-100 hover:text-primary hover:shadow-lg hover:shadow-primary/20 transform hover:scale-105 transition-all duration-200"
                            onClick={() => { setEditItem(s); setModalOpen(true); }}
                          >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
                          </button>
                          <button
                            className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 hover:shadow-lg hover:shadow-red-500/20 transform hover:scale-105 transition-all duration-200"
                            onClick={() => setDeleteModal({ open: true, item: s })}
                          >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <SettingsModal
          open={modalOpen}
          mode={editItem ? 'edit' : 'create'}
          initial={editItem || undefined}
          onClose={() => setModalOpen(false)}
          onSuccess={() => { load(); }}
        />
        {deleteModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteModal({ open: false, item: null })} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 text-center">
                <div className="text-xl font-bold text-gray-900 mb-2">Delete Setting</div>
                <div className="text-gray-500 mb-6">
                  Are you sure you want to delete "<span className="font-semibold text-gray-700">{deleteModal.item?.setting_key}</span>"?
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setDeleteModal({ open: false, item: null })}
                    className="px-6 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onDelete}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;
