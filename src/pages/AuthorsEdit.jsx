import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuthorById, updateAuthor, deleteAuthor, uploadStorage } from '../services/admin';

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  is_active: z.boolean().optional(),
});

function AuthorsEdit() {
  const { id } = useParams();
  const { register, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
  });
  const [imageKey, setImageKey] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const data = await getAuthorById(id);
      reset({
        name: data.name,
        slug: data.slug,
        is_active: !!data.is_active,
      });
      setImageKey(data.image || '');
    })();
  }, [id, reset]);

  const onUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadStorage(file, 'thumbnails');
    setImageKey(res.key);
    setUploading(false);
  };

  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      bio: null,
      image: imageKey || null,
      is_active: values.is_active ? 1 : 0,
    };
    await updateAuthor(id, payload);
    navigate('/dashboard/authors', { replace: true });
  };

  const onDelete = async () => {
    await deleteAuthor(id);
    navigate('/dashboard/authors', { replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-lg">دەستکاریکردنی نووسەر</div>
        <button className="px-3 py-2 rounded border text-red-600" onClick={onDelete}>سڕینەوە</button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">ناو</label>
            <input className="w-full border rounded px-3 py-2" {...register('name')} />
            {formState.errors.name && <p className="text-red-600 text-sm">پێویستە</p>}
          </div>
          <div>
            <label className="text-sm">سلەگ</label>
            <input className="w-full border rounded px-3 py-2" {...register('slug')} />
            {formState.errors.slug && <p className="text-red-600 text-sm">پێویستە</p>}
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('is_active')} />
            چالاک
          </label>
        </div>
        <div>
          <label className="text-sm">وێنە</label>
          <input className="w-full" type="file" accept=".jpg,.jpeg,.png,.webp" onChange={onUploadImage} />
          <div className="text-xs text-gray-600 mt-1">{uploading ? 'بارکردن...' : (imageKey || 'هیچ')}</div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-black text-white" type="submit">پاشەکەوت</button>
          <button className="px-4 py-2 rounded border" type="button" onClick={() => navigate('/dashboard/authors')}>گەرانەوە</button>
        </div>
      </form>
    </div>
  );
}

export default AuthorsEdit;
