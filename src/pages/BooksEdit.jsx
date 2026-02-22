import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { getBookById, updateBook, deleteBook, uploadStorage, getAdminCategories, getAdminAuthors, getAdminSubcategories } from '../services/admin';

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

function BooksEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState, reset, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, is_featured: false },
  });
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [fileKey, setFileKey] = useState('');
  const [thumbKey, setThumbKey] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteFile, setDeleteFile] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [authorId, setAuthorId] = useState('');
  const [authorRole, setAuthorRole] = useState('author');
  const [specs, setSpecs] = useState([]);
  const [specName, setSpecName] = useState('');
  const [specValue, setSpecValue] = useState('');

  useEffect(() => {
    (async () => {
      const data = await getBookById(id);
      reset({
        title: data.title,
        slug: data.slug,
        category_id: data.category_id ? String(data.category_id) : '',
        subcategory_id: data.subcategory_id ? String(data.subcategory_id) : '',
        short_description: data.short_description || '',
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || '',
        is_active: !!data.is_active,
        is_featured: !!data.is_featured,
      });
      setFileKey(data.file_key || '');
      setThumbKey(data.thumbnail || '');
      const cats = await getAdminCategories();
      setCategories(Array.isArray(cats) ? cats : (cats?.items ?? []));
      const auths = await getAdminAuthors({ page: 1, limit: 100 });
      setAuthors(Array.isArray(auths) ? auths : (auths?.items ?? []));
      const dataAuthors = Array.isArray(data.authors) ? data.authors : [];
      setSelectedAuthors(dataAuthors.map((a) => ({ id: a.id, name: a.name, role: a.role || 'author' })));
      const dataSpecs = Array.isArray(data.specifications) ? data.specifications : [];
      setSpecs(dataSpecs.map((s) => ({ name: s.spec_name ?? s.name ?? '', value: s.spec_value ?? s.value ?? '' })));
    })();
  }, [id, reset]);
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
      specifications: specs.map((s) => ({ name: s.name, value: s.value })),
    };
    await updateBook(id, payload);
    navigate('/dashboard/books', { replace: true });
  };

  const onDelete = async () => {
    await deleteBook(id, { deleteFile });
    navigate('/dashboard/books', { replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-lg">Edit Book</div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={deleteFile} onChange={(e) => setDeleteFile(e.target.checked)} />
            Delete file from R2
          </label>
          <button className="px-3 py-2 rounded border text-red-600" onClick={onDelete}>Delete</button>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Title</label>
            <input className="w-full border rounded px-3 py-2" {...register('title')} />
            {formState.errors.title && <p className="text-red-600 text-sm">Required</p>}
          </div>
          <div>
            <label className="text-sm">Slug</label>
            <input className="w-full border rounded px-3 py-2" {...register('slug')} />
            {formState.errors.slug && <p className="text-red-600 text-sm">Required</p>}
          </div>
          <div>
            <label className="text-sm">Category</label>
            <select className="w-full border rounded px-3 py-2" {...register('category_id')}>
              <option value="">-</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Subcategory</label>
            <select className="w-full border rounded px-3 py-2" {...register('subcategory_id')}>
              <option value="">-</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm">Short Description</label>
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
          <div className="font-semibold">Authors</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <select className="border rounded px-3 py-2" value={authorId} onChange={(e) => setAuthorId(e.target.value)}>
              <option value="">Select Author</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <select className="border rounded px-3 py-2" value={authorRole} onChange={(e) => setAuthorRole(e.target.value)}>
              <option value="author">Author</option>
              <option value="translator">Translator</option>
              <option value="editor">Editor</option>
            </select>
            <button type="button" className="px-3 py-2 border rounded" onClick={() => {
              if (!authorId) return;
              const exists = selectedAuthors.some((a) => String(a.id) === String(authorId));
              if (exists) return;
              const author = authors.find((a) => String(a.id) === String(authorId));
              if (!author) return;
              setSelectedAuthors([...selectedAuthors, { id: author.id, name: author.name, role: authorRole }]);
              setAuthorId('');
              setAuthorRole('author');
            }}>Add</button>
          </div>
          {selectedAuthors.length > 0 && (
            <div className="rounded border bg-white overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2">Author</th>
                    <th className="text-left px-3 py-2">Role</th>
                    <th className="text-left px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAuthors.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="px-3 py-2">{a.name}</td>
                      <td className="px-3 py-2">{a.role}</td>
                      <td className="px-3 py-2">
                        <button type="button" className="px-2 py-1 border rounded text-red-600" onClick={() => {
                          setSelectedAuthors(selectedAuthors.filter((x) => String(x.id) !== String(a.id)));
                        }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="font-semibold">Specifications</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input className="border rounded px-3 py-2" placeholder="Name" value={specName} onChange={(e) => setSpecName(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="Value" value={specValue} onChange={(e) => setSpecValue(e.target.value)} />
            <button type="button" className="px-3 py-2 border rounded" onClick={() => {
              if (!specName || !specValue) return;
              setSpecs([...specs, { name: specName, value: specValue }]);
              setSpecName('');
              setSpecValue('');
            }}>Add</button>
          </div>
          {specs.length > 0 && (
            <div className="rounded border bg-white overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-3 py-2">Name</th>
                    <th className="text-left px-3 py-2">Value</th>
                    <th className="text-left px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {specs.map((s, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{s.name}</td>
                      <td className="px-3 py-2">{s.value}</td>
                      <td className="px-3 py-2">
                        <button type="button" className="px-2 py-1 border rounded text-red-600" onClick={() => {
                          setSpecs(specs.filter((_, i) => i !== idx));
                        }}>Delete</button>
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
            Active
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('is_featured')} />
            Featured
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Book file (pdf)</label>
            <input className="w-full" type="file" accept=".pdf" onChange={onUploadFile} />
            <div className="text-xs text-gray-600 mt-1">{uploading ? 'Uploading...' : (fileKey || 'None')}</div>
          </div>
          <div>
            <label className="text-sm">Thumbnail image</label>
            <input className="w-full" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={onUploadThumb} />
            <div className="text-xs text-gray-600 mt-1">{uploading ? 'Uploading...' : (thumbKey || 'None')}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-black text-white" type="submit">Save</button>
          <button className="px-4 py-2 rounded border" type="button" onClick={() => navigate('/dashboard/books')}>Back</button>
        </div>
      </form>
    </div>
  );
}

export default BooksEdit;
