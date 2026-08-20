import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import BannerModal from '../components/shared/BannerModal';
import SettingsModal from '../components/shared/SettingsModal';
import {
  deleteAdminSetting,
  deleteHeroBanner,
  getAdminHeroBanners,
  getAdminSettings,
  getStorageUrl,
} from '../services/admin';

function SettingsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const [banners, setBanners] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editBanner, setEditBanner] = useState(null);
  const [bannerDeleteModal, setBannerDeleteModal] = useState({ open: false, item: null });
  const [bannerURLs, setBannerURLs] = useState({});

  const loadSettings = async () => {
    setLoading(true);
    try {
      const list = await getAdminSettings();
      let normalized = [];
      if (Array.isArray(list)) {
        normalized = list
          .map((it) => ({
            setting_key: it.setting_key ?? it.key ?? '',
            setting_value: it.setting_value ?? it.value ?? '',
          }))
          .filter((x) => x.setting_key);
      } else if (list && typeof list === 'object') {
        normalized = Object.entries(list).map(([k, v]) => ({
          setting_key: k,
          setting_value: String(v ?? ''),
        }));
      }
      setItems(normalized);
    } finally {
      setLoading(false);
    }
  };

  const loadBanners = async () => {
    setBannerLoading(true);
    try {
      const list = await getAdminHeroBanners();
      setBanners(Array.isArray(list) ? list : []);
    } finally {
      setBannerLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    loadBanners();
  }, []);

  useEffect(() => {
    (async () => {
      const keys = banners.map((item) => item.image).filter(Boolean);
      if (keys.length === 0) {
        setBannerURLs({});
        return;
      }

      const entries = await Promise.all(
        keys.map(async (key) => {
          try {
            const res = await getStorageUrl(key);
            return [key, res?.url || ''];
          } catch {
            return [key, ''];
          }
        })
      );

      const map = {};
      entries.forEach(([key, url]) => {
        map[key] = url;
      });
      setBannerURLs(map);
    })();
  }, [banners]);

  const filtered = useMemo(() => {
    if (!q) return items;
    const v = q.toLowerCase();
    return items.filter(
      (i) =>
        (i.setting_key || '').toLowerCase().includes(v) ||
        (i.setting_value || '').toLowerCase().includes(v)
    );
  }, [items, q]);

  const onDeleteSetting = async () => {
    if (!deleteModal.item) return;
    await deleteAdminSetting(deleteModal.item.setting_key);
    toast.success('Setting deleted');
    setDeleteModal({ open: false, item: null });
    loadSettings();
  };

  const onDeleteBanner = async () => {
    if (!bannerDeleteModal.item) return;
    await deleteHeroBanner(bannerDeleteModal.item.id);
    toast.success('Hero banner deleted');
    setBannerDeleteModal({ open: false, item: null });
    loadBanners();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Website Settings
          </h1>
          <p className="text-gray-500">Manage hero banner images and general site settings from one place.</p>
        </div>

        <section className="rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Hero Banners</h2>
              <p className="text-sm text-gray-500">These images are used in the website home page slider.</p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-3 font-medium text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5"
              onClick={() => {
                setEditBanner(null);
                setBannerModalOpen(true);
              }}
            >
              Add Banner
            </button>
          </div>

          {bannerLoading ? (
            <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center text-gray-500">
              Loading banners...
            </div>
          ) : banners.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center text-gray-500">
              No hero banners found yet.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/70 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Preview</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Title</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Subtitle</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Order</th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {banners.map((banner) => {
                    const preview = banner.image ? bannerURLs[banner.image] : '';
                    return (
                      <tr key={banner.id} className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent">
                        <td className="px-6 py-4">
                          {preview ? (
                            <img src={preview} alt={banner.title || 'Banner'} className="h-16 w-28 rounded-xl object-cover shadow-sm" />
                          ) : (
                            <div className="flex h-16 w-28 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                              No preview
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{banner.title || 'Untitled banner'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="max-w-md truncate text-sm text-gray-500">{banner.subtitle || '-'}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{banner.sort_order ?? 0}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              Number(banner.is_active) === 1
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {Number(banner.is_active) === 1 ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="rounded-xl bg-gray-100 p-2.5 text-gray-600 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                              onClick={() => {
                                setEditBanner(banner);
                                setBannerModalOpen(true);
                              }}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              className="rounded-xl bg-gray-100 p-2.5 text-gray-600 transition-all duration-200 hover:bg-red-100 hover:text-red-600"
                              onClick={() => setBannerDeleteModal({ open: true, item: banner })}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="space-y-6 rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">General Settings</h2>
              <p className="text-sm text-gray-500">Manage text-based settings used across the dashboard and website.</p>
            </div>
            <button
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-5 py-3 font-medium text-white shadow-lg shadow-primary/30 transition-all duration-200 hover:-translate-y-0.5"
              onClick={() => {
                setEditItem(null);
                setModalOpen(true);
              }}
            >
              Add Setting
            </button>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <input
              className="w-full rounded-xl border-2 border-transparent bg-gray-50/80 px-4 py-3 text-gray-900 placeholder-gray-400 outline-none transition-all duration-200 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
              placeholder="Search settings..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            {loading ? (
              <div className="p-6 text-gray-500">Loading settings...</div>
            ) : filtered.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No settings found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Key</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Value</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((s) => (
                      <tr key={s.setting_key} className="group transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{s.setting_key}</div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="max-w-xl truncate text-sm text-gray-600">{s.setting_value || ''}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              className="rounded-xl bg-gray-100 p-2.5 text-gray-600 transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                              onClick={() => {
                                setEditItem({ setting_key: s.setting_key, setting_value: s.setting_value });
                                setModalOpen(true);
                              }}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              className="rounded-xl bg-gray-100 p-2.5 text-gray-600 transition-all duration-200 hover:bg-red-100 hover:text-red-600"
                              onClick={() => setDeleteModal({ open: true, item: { setting_key: s.setting_key, setting_value: s.setting_value } })}
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        </section>

        <BannerModal
          open={bannerModalOpen}
          mode={editBanner ? 'edit' : 'create'}
          initial={editBanner || undefined}
          onClose={() => setBannerModalOpen(false)}
          onSuccess={() => {
            loadBanners();
          }}
        />

        <SettingsModal
          open={modalOpen}
          mode={editItem ? 'edit' : 'create'}
          initial={editItem || undefined}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            loadSettings();
          }}
        />

        {deleteModal.open && (
          <ConfirmDeleteModal
            title="Delete Setting"
            message={`Are you sure you want to delete "${deleteModal.item?.setting_key}"?`}
            onCancel={() => setDeleteModal({ open: false, item: null })}
            onConfirm={onDeleteSetting}
          />
        )}

        {bannerDeleteModal.open && (
          <ConfirmDeleteModal
            title="Delete Hero Banner"
            message={`Are you sure you want to delete "${bannerDeleteModal.item?.title || 'this banner'}"?`}
            onCancel={() => setBannerDeleteModal({ open: false, item: null })}
            onConfirm={onDeleteBanner}
          />
        )}
      </div>
    </div>
  );
}

function ConfirmDeleteModal({ title, message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="p-6 text-center">
          <div className="mb-2 text-xl font-bold text-gray-900">{title}</div>
          <div className="mb-6 text-gray-500">{message}</div>
          <div className="flex justify-center gap-3">
            <button
              onClick={onCancel}
              className="rounded-xl border-2 border-gray-200 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-6 py-2.5 font-medium text-white hover:from-red-600 hover:to-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
