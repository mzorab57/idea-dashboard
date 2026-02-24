import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadStorage, createBook, getAdminCategories, getAdminAuthors, getAdminSubcategories } from '../services/admin';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  category_id: z.string().optional(),
  subcategory_id: z.string().optional(),
  short_description: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
});

function BooksCreate() {
  const { register, handleSubmit, formState, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, is_featured: false },
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [authorId, setAuthorId] = useState('');
  const [authorRole, setAuthorRole] = useState('author');
  const [specs, setSpecs] = useState([]);
  const [specName, setSpecName] = useState('');
  const [specValue, setSpecValue] = useState('');
  const [specGroup, setSpecGroup] = useState('');
  const [specVisible, setSpecVisible] = useState(true);
  const [fileKey, setFileKey] = useState('');
  const [thumbKey, setThumbKey] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const data = await getAdminCategories();
      setCategories(Array.isArray(data) ? data : (data?.categories ?? (data?.items ?? [])));
      const auths = await getAdminAuthors({ page: 1, limit: 100 });
      setAuthors(Array.isArray(auths) ? auths : (auths?.items ?? []));
    })();
  }, []);
  const categoryIdValue = watch('category_id');
  useEffect(() => {
    (async () => {
      if (!categoryIdValue) { setSubcategories([]); return; }
      const subs = await getAdminSubcategories({ category_id: Number(categoryIdValue), limit: 100 });
      setSubcategories(Array.isArray(subs) ? subs : (subs?.items ?? []));
    })();
  }, [categoryIdValue]);

  const onUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadStorage(file, 'books');
    setFileKey(res.key);
    setUploading(false);
  };
  const onUploadThumb = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadStorage(file, 'thumbnails');
    setThumbKey(res.key);
    setUploading(false);
  };

  const onSubmit = async (values) => {
    const payload = {
      title: values.title,
      slug: values.slug,
      short_description: values.short_description || null,
      long_description: null,
      category_id: values.category_id ? Number(values.category_id) : null,
      subcategory_id: values.subcategory_id ? Number(values.subcategory_id) : null,
      file_key: fileKey || null,
      thumbnail: thumbKey || null,
      is_featured: values.is_featured ? 1 : 0,
      is_active: values.is_active ? 1 : 0,
      meta_title: values.meta_title || null,
      meta_description: values.meta_description || null,
      authors: selectedAuthors.map((a) => ({ id: a.id, role: a.role })),
      specifications: specs.map((s) => ({ name: s.name, value: s.value, group: s.group || null, is_visible: s.is_visible ? 1 : 0 })),
    };
    await createBook(payload);
    navigate('/dashboard/books', { replace: true });
  };

  const addAuthor = () => {
    if (!authorId) return;
    const exists = selectedAuthors.some((a) => String(a.id) === String(authorId));
    if (exists) return;
    const author = authors.find((a) => String(a.id) === String(authorId));
    if (!author) return;
    setSelectedAuthors([...selectedAuthors, { id: author.id, name: author.name, role: authorRole }]);
    setAuthorId('');
    setAuthorRole('author');
  };
  const removeAuthor = (id) => {
    setSelectedAuthors(selectedAuthors.filter((a) => String(a.id) !== String(id)));
  };
  const addSpec = () => {
    if (!specName || !specValue) return;
    setSpecs([...specs, { name: specName, value: specValue, group: specGroup, is_visible: specVisible ? 1 : 0 }]);
    setSpecName('');
    setSpecValue('');
    setSpecGroup('');
    setSpecVisible(true);
  };
  const removeSpec = (idx) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm">سەرناو</label>
          <input className="w-full border rounded px-3 py-2" {...register('title')} />
          {formState.errors.title && <p className="text-red-600 text-sm">پێویستە</p>}
        </div>
        <div>
          <label className="text-sm">سلەگ</label>
          <input className="w-full border rounded px-3 py-2" {...register('slug')} />
          {formState.errors.slug && <p className="text-red-600 text-sm">پێویستە</p>}
        </div>
        <div>
          <label className="text-sm">پۆل</label>
          <select className="w-full border rounded px-3 py-2" {...register('category_id')}>
            <option value="">-</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm">ژێرپۆل</label>
          <select className="w-full border rounded px-3 py-2" {...register('subcategory_id')}>
            <option value="">-</option>
            {subcategories.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm">کورتە</label>
          <input className="w-full border rounded px-3 py-2" {...register('short_description')} />
        </div>
        <div>
          <label className="text-sm">Meta Title</label>
          <input className="w-full border rounded px-3 py-2" {...register('meta_title')} />
        </div>
        <div>
          <label className="text-sm">Meta Description</label>
          <input className="w-full border rounded px-3 py-2" {...register('meta_description')} />
        </div>
      </div>
      <div className="space-y-2">
        <div className="font-semibold">نووسەران</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <select className="border rounded px-3 py-2" value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
            <option value="">هەلبژاردنی نووسەر</option>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <select className="border rounded px-3 py-2" value={authorRole} onChange={(e) => setAuthorRole(e.target.value)}>
            <option value="author">نووسەر</option>
            <option value="translator">وەرگێڕ</option>
            <option value="editor">سەرنوسەر</option>
          </select>
          <button type="button" className="px-3 py-2 border rounded" onClick={addAuthor}>زیادکردن</button>
        </div>
        {selectedAuthors.length > 0 && (
          <div className="rounded border bg-white overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2">نووسەر</th>
                  <th className="text-left px-3 py-2">ڕۆڵ</th>
                  <th className="text-left px-3 py-2">کردار</th>
                </tr>
              </thead>
              <tbody>
                {selectedAuthors.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-3 py-2">{a.name}</td>
                    <td className="px-3 py-2">{a.role}</td>
                    <td className="px-3 py-2">
                      <button type="button" className="px-2 py-1 border rounded text-red-600" onClick={() => removeAuthor(a.id)}>سڕینەوە</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <div className="font-semibold">تایبەتمەندییەکان</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <input className="border rounded px-3 py-2" placeholder="ناو" value={specName} onChange={(e) => setSpecName(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="بەها" value={specValue} onChange={(e) => setSpecValue(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="گروپ" value={specGroup} onChange={(e) => setSpecGroup(e.target.value)} />
          <label className="flex items-center gap-2 px-3 py-2 border rounded">
            <input type="checkbox" checked={specVisible} onChange={(e) => setSpecVisible(e.target.checked)} />
            <span className="text-sm">دەرکەوتوو</span>
          </label>
          <button type="button" className="px-3 py-2 border rounded" onClick={addSpec}>زیادکردن</button>
        </div>
        {specs.length > 0 && (
          <div className="rounded border bg-white overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-2">ناو</th>
                  <th className="text-left px-3 py-2">گروپ</th>
                  <th className="text-left px-3 py-2">بەها</th>
                  <th className="text-left px-3 py-2">دەرکەوتوو</th>
                  <th className="text-left px-3 py-2">کردار</th>
                </tr>
              </thead>
              <tbody>
                {specs.map((s, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2">
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={s.group || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSpecs(specs.map((x, i) => i === idx ? { ...x, group: v } : x));
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">{s.value}</td>
                    <td className="px-3 py-2">
                      <label className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!s.is_visible}
                          onChange={(e) => {
                            const v = e.target.checked ? 1 : 0;
                            setSpecs(specs.map((x, i) => i === idx ? { ...x, is_visible: v } : x));
                          }}
                        />
                        <span className="text-xs">{s.is_visible ? 'Visible' : 'Hidden'}</span>
                      </label>
                    </td>
                    <td className="px-3 py-2">
                      <button type="button" className="px-2 py-1 border rounded text-red-600" onClick={() => removeSpec(idx)}>سڕینەوە</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="flex gap-6 items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('is_active')} />
          چالاک
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('is_featured')} />
          نیشاندراو
        </label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm">فایل کتێب (pdf)</label>
          <input className="w-full" type="file" accept=".pdf" onChange={onUploadFile} />
          <div className="text-xs text-gray-600 mt-1">{uploading ? 'بارکردن...' : (fileKey || 'هیچ')}</div>
        </div>
        <div>
          <label className="text-sm">وێنەی thumbnail</label>
          <input className="w-full" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={onUploadThumb} />
          <div className="text-xs text-gray-600 mt-1">{uploading ? 'بارکردن...' : (thumbKey || 'هیچ')}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded bg-black text-white" type="submit">زیادکردن</button>
        <button className="px-4 py-2 rounded border" type="button" onClick={() => navigate('/dashboard/books')}>گەرانەوە</button>
      </div>
    </form>
  );
}

export default BooksCreate;
