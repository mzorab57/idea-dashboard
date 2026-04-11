import { useEffect, useState } from 'react';
import { getEmployeePermissions, updateEmployeePermissions } from '../../services/admin';
import { toast } from 'react-toastify';

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-sm">{label}</span>
    </label>
  );
}

export default function PermissionsModal({ open, user, onClose, onSuccess }) {
  const [data, setData] = useState({});
  const [saving, setSaving] = useState(false);
  const resources = ['categories', 'subcategories', 'authors', 'books'];

  useEffect(() => {
    if (!open || !user?.id) return;
    (async () => {
      try {
        const res = await getEmployeePermissions(user.id);
        const normalized = {};
        for (const r of resources) {
          normalized[r] = {
            create: Boolean(res?.[r]?.create),
            update: Boolean(res?.[r]?.update),
            delete: Boolean(res?.[r]?.delete),
          };
        }
        setData(normalized);
      } catch {
        const blank = {};
        for (const r of resources) blank[r] = { create: false, update: false, delete: false };
        setData(blank);
      }
    })();
  }, [open, user?.id]);

  const setFlag = (res, key, val) => {
    setData((d) => ({ ...d, [res]: { ...(d[res] || {}), [key]: val } }));
  };

  const onSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateEmployeePermissions(user.id, data);
      toast.success('Permissions updated');
      onClose?.();
      onSuccess?.();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-none md:rounded-2xl shadow-2xl w-full h-[100vh] md:h-auto md:max-w-2xl overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-primary to-secondary text-white">
          <div className="text-lg font-bold">Permissions for {user?.full_name} ({user?.role})</div>
          <div className="text-xs opacity-80">Control what this employee can Create / Update / Delete</div>
        </div>
        <div className="p-6 space-y-4">
          <table className="w-full text-sm border rounded">
            <thead>
              <tr className="bg-gray-50 text-gray-600">
                <th className="text-left px-4 py-3">Resource</th>
                <th className="text-left px-4 py-3">Create</th>
                <th className="text-left px-4 py-3">Update</th>
                {/* <th className="text-left px-4 py-3">Delete</th> */}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resources.map((r) => (
                <tr key={r} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium capitalize">{r}</td>
                  <td className="px-4 py-3">
                    <Toggle checked={data?.[r]?.create} onChange={(v) => setFlag(r, 'create', v)} label="Allow" />
                  </td>
                  <td className="px-4 py-3">
                    <Toggle checked={data?.[r]?.update} onChange={(v) => setFlag(r, 'update', v)} label="Allow" />
                  </td>
                  {/* <td className="px-4 py-3">
                    <Toggle checked={data?.[r]?.delete} onChange={(v) => setFlag(r, 'delete', v)} label="Allow" />
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-medium disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
