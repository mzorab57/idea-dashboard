import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useEditor, EditorContent } from '@tiptap/react';
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadStorage, createBook, updateBook, getAdminCategories, getAdminAuthors, getAdminSubcategories, getStorageUrl, getBookById } from '../../services/admin';
import { toast } from 'react-toastify';

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2h3l2-2h5a2 2 0 002-2V6a2 2 0 00-2-2h-5z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const schema = z.object({
  title:             z.string().min(1),
  slug:              z.string().min(1),
  category_id:       z.string().optional(),
  subcategory_id:    z.string().optional(),
  short_description: z.string().optional(),
  long_description:  z.string().optional(),
  youtube_url: z.string().optional(),
  meta_title:        z.string().optional(),
  meta_description:  z.string().optional(),
  is_active:         z.boolean().optional(),
  is_featured:       z.boolean().optional(),
});

/* ── normalize role helper ── */
const normalizeRole = (r) => {
  const x = String(r || '').toLowerCase().trim();
  if (['author',     'writer',      'نووسەر'            ].includes(x)) return 'author';
  if (['translator', 'translation', 'وەرگێڕ', 'wargeyr' ].includes(x)) return 'translator';
  if (['editor',     'edit',        'ئیدیتۆر'           ].includes(x)) return 'editor';
  return 'author';
};

const rgbToHex = (rgb) => {
  if (!rgb || !rgb.startsWith('rgb')) return rgb || '#000000';
  const parts = rgb.match(/\d+/g);
  if (!parts) return '#000000';
  const hex = (n) => parseInt(n).toString(16).padStart(2, '0');
  return `#${hex(parts[0])}${hex(parts[1])}${hex(parts[2])}`;
};

function RichText({ value, onChange, placeholder }) {
 const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle, // ئێستا ئەمە کار دەکات چونکە بە { } بانگمان کردووە لە سەرەوە
      Color,
    ],
    content: value || '',
    editorProps: { 
      attributes: { class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] p-3' } 
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  }, []);
  useEffect(() => {
    if (!editor) return;
    const cur = editor.getHTML();
    const next = value || '';
    if (cur !== next) {
      editor.commands.setContent(next, false);
    }
  }, [value, editor]);
  const active = (a) => (editor && editor.isActive(a) ? 'bg-gray-200' : '');
  return (
   <div className="border-2 border-transparent rounded-xl bg-gray-50 focus-within:bg-white focus-within:border-primary">
      <div className="flex items-center gap-2 px-2 py-1 border-b flex-wrap">
        <button type="button" className={`px-2 py-1 rounded ${active('bold')}`} onClick={() => editor?.chain().focus().toggleBold().run()}>B</button>
        <button type="button" className={`px-2 py-1 rounded ${active('italic')}`} onClick={() => editor?.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" className={`px-2 py-1 rounded ${active('bulletList')}`} onClick={() => editor?.chain().focus().toggleBulletList().run()}>•</button>
        
        {/* بەشی ڕەنگ بە ستایلی جوانتر */}
        <div className="flex items-center gap-1 border-l pl-2 ml-1">
         <input
  type="color"
  className="w-6 h-6 cursor-pointer bg-transparent border-none"
  onInput={event => editor.chain().focus().setColor(event.target.value).run()}
  // لێرەدا فەنکشنەکە بەکاربهێنە بۆ ئەوەی RGB بکات بە Hex
  value={rgbToHex(editor.getAttributes('textStyle').color)}
/>
          <button 
            type="button"
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="text-xs hover:text-red-500"
          >
            Clear Color
          </button>
        </div>

        <button
          type="button"
          className="ml-auto px-2 py-1 rounded text-sm text-gray-500 hover:text-red-500"
          onClick={() => {
            editor?.commands.clearContent();
            onChange('');
          }}
        >
          Clear
        </button>
      </div>
      {!value && <div className="px-3 pt-2 text-sm text-gray-400 absolute">{placeholder}</div>}
      <EditorContent editor={editor} />
    </div>
  );
}

export default function BooksModal({ open, mode = 'create', initial, onClose, onSuccess }) {
  const {
    register, control, handleSubmit, reset, watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true, is_featured: false },
  });

  const [categories,     setCategories]     = useState([]);
  const [subcategories,  setSubcategories]  = useState([]);
  const [authors,        setAuthors]        = useState([]);
  const [selectedAuthors,setSelectedAuthors]= useState([]);
  const [authorId,       setAuthorId]       = useState('');
  const [authorRole,     setAuthorRole]     = useState('author');
  const [authorSearch,   setAuthorSearch]   = useState('');
  const [specs,          setSpecs]          = useState([]);
  const [specName,       setSpecName]       = useState('');
  const [specValue,      setSpecValue]      = useState('');
  const [specGroup,      setSpecGroup]      = useState('');
  const [specVisible,    setSpecVisible]    = useState(true);
  const [fileKey,        setFileKey]        = useState('');
  const [thumbKey,       setThumbKey]       = useState('');
  const [thumbUrl,       setThumbUrl]       = useState('');
  const [uploading,      setUploading]      = useState(false);

  const isActiveVal    = watch('is_active');
  const isFeaturedVal  = watch('is_featured');
  const categoryIdValue= watch('category_id');

  const filteredAuthors = authors
    .filter((a) => (a.name || '').toLowerCase().includes(authorSearch.toLowerCase()))
    .slice(0, 5);

  /* ── load categories + authors ── */
  useEffect(() => {
    if (!open) return;
    (async () => {
      const cats  = await getAdminCategories();
      setCategories(Array.isArray(cats) ? cats : (cats?.categories ?? (cats?.items ?? [])));
      const auths = await getAdminAuthors({ page: 1, limit: 200 });
      setAuthors(Array.isArray(auths) ? auths : (auths?.items ?? []));
    })();
  }, [open]);

  /* ── load subcategories on category change ── */
  useEffect(() => {
    (async () => {
      if (!categoryIdValue) { setSubcategories([]); return; }
      const subs = await getAdminSubcategories({ category_id: Number(categoryIdValue), limit: 200 });
      setSubcategories(Array.isArray(subs) ? subs : (subs?.items ?? []));
    })();
  }, [categoryIdValue]);

  /* ── reset form on open/mode change ── */
  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initial) {
      reset({
        title:             initial.title             || '',
        slug:              initial.slug              || '',
        category_id:       initial.category_id       ? String(initial.category_id)    : '',
        subcategory_id:    initial.subcategory_id    ? String(initial.subcategory_id) : '',
        short_description: initial.short_description || '',
        long_description:  initial.long_description  || '',
        youtube_url: initial.youtube_url || '',
        meta_title:        initial.meta_title        || '',
        meta_description:  initial.meta_description  || '',
        is_active:         !!initial.is_active,
        is_featured:       !!initial.is_featured,
      });
      setFileKey(initial.file_key  || '');
      setThumbKey(initial.thumbnail || '');
      /* set authors from initial with normalized roles */
      const initAuthors = Array.isArray(initial.authors) ? initial.authors : [];
      setSelectedAuthors(initAuthors.map((a) => ({
        id:   a.id,
        name: a.name,
        role: normalizeRole(a.role),
      })));
      const initSpecs = Array.isArray(initial.specifications) ? initial.specifications : [];
      setSpecs(initSpecs.map((s) => ({
        name:       s.spec_name  ?? s.name  ?? '',
        value:      s.spec_value ?? s.value ?? '',
        group:      s.group      ?? '',
        is_visible: (s.is_visible ?? 1) ? 1 : 0,
      })));
    } else {
      reset({
        title: '', slug: '', category_id: '', subcategory_id: '',
        short_description: '', long_description: '',
        meta_title: '', meta_description: '',
        is_active: true, is_featured: false,
      });
      setFileKey('');
        youtube_url: '',
      setThumbKey('');
      setSelectedAuthors([]);
      setSpecs([]);
      setSubcategories([]);
      setAuthorId('');
      setFileKey('');
      setThumbKey('');
      setSelectedAuthors([]);
      setSpecs([]);
      setSubcategories([]);
      setAuthorId('');
      setAuthorRole('author');
      setAuthorSearch('');
      setSpecName('');
      setSpecValue('');
      setSpecGroup('');
      setSpecVisible(true);
    }
  }, [open, mode, initial, reset]);

  /* ── fetch fresh book data for edit (roles from API) ── */
  useEffect(() => {
    if (!open || mode !== 'edit' || !initial?.id) return;
    (async () => {
      try {
        const b    = await getBookById(initial.id);
        const auth = Array.isArray(b?.authors) ? b.authors : [];
        /* normalize roles coming from API */
        setSelectedAuthors(auth.map((a) => ({
          id:   a.id,
          name: a.name,
          role: normalizeRole(a.role),
        })));
        const sp = Array.isArray(b?.specifications) ? b.specifications : [];
        setSpecs(sp.map((s) => ({
          name:       s.spec_name  ?? s.name  ?? '',
          value:      s.spec_value ?? s.value ?? '',
          group:      s.group      ?? '',
          is_visible: (s.is_visible ?? 1) ? 1 : 0,
        })));
      } catch (e) {
        void e;
      }
    })();
  }, [open, mode, initial?.id]);

  /* ── thumbnail preview ── */
  useEffect(() => {
    (async () => {
      if (!thumbKey) { setThumbUrl(''); return; }
      try {
        const d = await getStorageUrl(thumbKey);
        setThumbUrl(d.url);
      } catch { setThumbUrl(''); }
    })();
  }, [thumbKey]);

  /* ── file uploads ── */
  const onUploadFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadStorage(file, 'books');
      setFileKey(res.key);
      toast.success('File uploaded');
    } catch { toast.error('Failed to upload file'); }
    finally { setUploading(false); }
  };

  const onUploadThumb = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadStorage(file, 'thumbnails');
      setThumbKey(res.key);
      toast.success('Thumbnail uploaded');
    } catch { toast.error('Failed to upload thumbnail'); }
    finally { setUploading(false); }
  };

  /* ── submit ── */
  const onSubmit = async (values) => {
    const payload = {
      title:            values.title,
      slug:             values.slug,
      short_description:values.short_description || null,
      long_description: values.long_description  || null,
      youtube_url: values.youtube_url || null,
      category_id:      values.category_id    ? Number(values.category_id)    : null,
      subcategory_id:   values.subcategory_id ? Number(values.subcategory_id) : null,
      file_key:         fileKey  || null,
      thumbnail:        thumbKey || null,
      is_featured:      values.is_featured ? 1 : 0,
      is_active:        values.is_active   ? 1 : 0,
      meta_title:       mode === 'edit' ? (values.meta_title       || null) : 'Meta Title',
      meta_description: mode === 'edit' ? (values.meta_description || null) : 'Meta Description',
      /* send id + normalized role */
      authors: selectedAuthors.map((a) => ({ id: a.id, role: normalizeRole(a.role) })),
      specifications: specs.map((s) => ({
        name:       s.name,
        value:      s.value,
        group:      s.group || null,
        is_visible: s.is_visible ? 1 : 0,
      })),
    };
    try {
      if (mode === 'edit' && initial?.id) {
        await updateBook(initial.id, payload);
        toast.success('Book updated successfully');
      } else {
        await createBook(payload);
        toast.success('Book created successfully');
      }
      onClose?.();
      onSuccess?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || 'Action failed');
    }
  };

  if (!open) return null;

  return (
    <div style={{marginTop: '0px'}} className="fixed rounded inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0  bg-black/50 backdrop-blur-sm"  onClick={onClose} />
      <div className="relative w-full rounded-2xl h-[90vh]  md:h-auto md:max-w-3xl bg-white md:rounded-2xl shadow-2xl animate-slideUp overflow-hidden md:max-h-[90vh] overflow-y-auto">

        {/* ── Header ── */}
        <div className="sticky top-0 z-10 px-6 py-5 bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white">
              <BookIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{mode === 'edit' ? 'Edit Book' : 'New Book'}</h2>
              <p className="text-sm text-rose-100">{mode === 'edit' ? 'Update book details' : 'Add a new book'}</p>
            </div>
          </div>
          <button
            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 backdrop-blur text-white hover:bg-white/30 flex items-center justify-center"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">

          {/* ── Basic fields ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Title</label>
              <input
                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 ${errors.title ? 'border-red-300' : 'border-transparent'}`}
                placeholder="Book title"
                {...register('title')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Slug</label>
              <input
                className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 ${errors.slug ? 'border-red-300' : 'border-transparent'}`}
                placeholder="book-slug"
                {...register('slug')}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Category</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                {...register('category_id')}
              >
                <option value="">-</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Subcategory</label>
              <select
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                {...register('subcategory_id')}
              >
                <option value="">-</option>
                {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Short Description</label>
              <Controller
                name="short_description"
                control={control}
                render={({ field }) => (
                  <RichText value={field.value} onChange={field.onChange} placeholder="Write a short summary..." />
                )}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Long Description</label>
              <Controller
                name="long_description"
                control={control}
                render={({ field }) => (
                  <RichText value={field.value} onChange={field.onChange} placeholder="Detailed description..." />
                )}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">YouTube URL</label>
              <input
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                placeholder="https://www.youtube.com/watch?v=..."
                {...register('youtube_url')}
              />
            </div>
            {/* {mode === 'edit' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Meta Title</label>
                  <input className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" {...register('meta_title')} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Meta Description</label>
                  <input className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" {...register('meta_description')} />
                </div>
              </>
            )} */}
          </div>

          {/* ── Authors ── */}
          <div className="space-y-3">
            <div className="font-semibold text-gray-900">Authors</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {/* search */}
              <div className="relative">
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Search author..."
                  value={authorSearch}
                  onChange={(e) => setAuthorSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const first = filteredAuthors[0];
                      if (first) { setAuthorId(String(first.id)); setAuthorSearch(first.name); }
                    }
                  }}
                />
                {authorSearch && (
                  <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow max-h-44 overflow-auto">
                    {filteredAuthors.length === 0
                      ? <div className="px-3 py-2 text-gray-500 text-sm">No authors found</div>
                      : filteredAuthors.map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            className="w-full text-left px-3 py-2 hover:bg-gray-50"
                            onClick={() => { setAuthorId(String(a.id)); setAuthorSearch(a.name); }}
                          >
                            {a.name}
                          </button>
                        ))
                    }
                  </div>
                )}
              </div>
              {/* role select */}
              <select
                className="border rounded px-3 py-2"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
              >
                <option value="author">Author</option>
                <option value="translator">Translator</option>
                <option value="editor">Editor</option>
              </select>
              {/* add button */}
              <button
                type="button"
                className={`px-3 py-2 rounded-xl border-2 ${authorId ? 'border-gray-200 hover:bg-gray-50' : 'border-gray-200 opacity-50 cursor-not-allowed'}`}
                onClick={() => {
                  if (!authorId) return;
                  const exists = selectedAuthors.some((a) => String(a.id) === String(authorId) && a.role === authorRole);
                  if (exists) return;
                  const author = authors.find((a) => String(a.id) === String(authorId));
                  if (!author) return;
                  setSelectedAuthors([...selectedAuthors, { id: author.id, name: author.name, role: authorRole }]);
                  setAuthorId('');
                  setAuthorRole('author');
                  setAuthorSearch('');
                }}
              >
                Add
              </button>
            </div>

            {/* authors table — grouped by role */}
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
                    {selectedAuthors.map((a, idx) => (
                      <tr key={`${a.id}-${idx}`} className="border-t">
                        <td className="px-3 py-2">{a.name}</td>
                        <td className="px-3 py-2">
                          {/* inline role change */}
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={normalizeRole(a.role)}
                            onChange={(e) => {
                              const newRole = e.target.value;
                              setSelectedAuthors(selectedAuthors.map((x, i) =>
                                i === idx ? { ...x, role: newRole } : x
                              ));
                            }}
                          >
                            <option value="author">Author</option>
                            <option value="translator">Translator</option>
                            <option value="editor">Editor</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className="px-2 py-1 border rounded text-red-600 hover:bg-red-50"
                            onClick={() => setSelectedAuthors(selectedAuthors.filter((_, i) => i !== idx))}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Specifications ── */}
          <div className="space-y-3">
            <div className="font-semibold text-gray-900">Specifications</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Current Group</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="Group"
                  value={specGroup}
                  onChange={(e) => setSpecGroup(e.target.value)}
                  list="group-suggestions"
                />
                <datalist id="group-suggestions">
                  {Array.from(new Set(specs.map((s) => s.group).filter(Boolean))).map((g) => (
                    <option key={g} value={g} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input className="border rounded px-3 py-2" placeholder="Name"  value={specName}  onChange={(e) => setSpecName(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Value" value={specValue} onChange={(e) => setSpecValue(e.target.value)} />
              <label className="flex items-center gap-2 px-3 py-2 border rounded">
                <input type="checkbox" checked={specVisible} onChange={(e) => setSpecVisible(e.target.checked)} />
                <span className="text-sm">Visible</span>
              </label>
              <button
                type="button"
                className="px-3 py-2 rounded-xl border-2 border-gray-200 hover:bg-gray-50"
                onClick={() => {
                  if (!specName || !specValue) return;
                  setSpecs([...specs, { name: specName, value: specValue, group: specGroup, is_visible: specVisible ? 1 : 0 }]);
                  setSpecName(''); setSpecValue(''); setSpecVisible(true);
                }}
              >
                Add
              </button>
            </div>
            {specs.length > 0 && (
              <div className="rounded border bg-white overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-3 py-2">Name</th>
                      <th className="text-left px-3 py-2">Group</th>
                      <th className="text-left px-3 py-2">Value</th>
                      <th className="text-left px-3 py-2">Visible</th>
                      <th className="text-left px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specs.map((s, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">
                          <input className="border rounded px-2 py-1 w-full" value={s.name}      onChange={(e) => setSpecs(specs.map((x, i) => i === idx ? { ...x, name:  e.target.value } : x))} />
                        </td>
                        <td className="px-3 py-2">
                          <input className="border rounded px-2 py-1 w-full" value={s.group||''} list="group-suggestions" onChange={(e) => setSpecs(specs.map((x, i) => i === idx ? { ...x, group: e.target.value } : x))} />
                        </td>
                        <td className="px-3 py-2">
                          <input className="border rounded px-2 py-1 w-full" value={s.value}     onChange={(e) => setSpecs(specs.map((x, i) => i === idx ? { ...x, value: e.target.value } : x))} />
                        </td>
                        <td className="px-3 py-2">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!s.is_visible}
                              onChange={(e) => setSpecs(specs.map((x, i) => i === idx ? { ...x, is_visible: e.target.checked ? 1 : 0 } : x))}
                            />
                            <span className="text-xs">{s.is_visible ? 'Visible' : 'Hidden'}</span>
                          </label>
                        </td>
                        <td className="px-3 py-2">
                          <button type="button" className="px-2 py-1 border rounded text-red-600 hover:bg-red-50" onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Toggles ── */}
          <div className="flex gap-6 items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register('is_active')} />
              <div className={`w-14 h-8 rounded-full transition-all duration-300 ${isActiveVal ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${isActiveVal ? 'translate-x-6' : 'translate-x-0'}`}>
                  {isActiveVal && <CheckIcon />}
                </div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">Active</span>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" {...register('is_featured')} />
              <div className={`w-14 h-8 rounded-full transition-all duration-300 ${isFeaturedVal ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gray-300'}`}>
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${isFeaturedVal ? 'translate-x-6' : 'translate-x-0'}`}>
                  {isFeaturedVal && <CheckIcon />}
                </div>
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">Featured</span>
            </label>
          </div>

          {/* ── File uploads ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Book file (pdf)</label>
              <input className="w-full" type="file" accept=".pdf" onChange={onUploadFile} />
              <div className="text-xs text-gray-600 mt-1">{uploading ? 'Uploading...' : (fileKey || 'None')}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Thumbnail image</label>
              <input className="w-full" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={onUploadThumb} />
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-600 mt-1">{uploading ? 'Uploading...' : (thumbKey || 'None')}</div>
                {thumbUrl && <img src={thumbUrl} alt="Thumbnail" className="w-16 h-16 object-cover rounded border" />}
              </div>
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg disabled:opacity-60"
            >
              {mode === 'edit' ? 'Save Changes' : 'Create Book'}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
