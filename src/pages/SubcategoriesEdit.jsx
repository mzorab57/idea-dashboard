import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSubcategoryById, updateSubcategory, deleteSubcategory, getAdminCategories } from '../services/admin';

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category_id: z.string().min(1),
  is_active: z.boolean().optional(),
});

function SubcategoriesEdit() {
  const { id } = useParams();
  const { register, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
  });
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const data = await getSubcategoryById(id);
      reset({
        name: data.name,
        slug: data.slug,
        category_id: data.category_id ? String(data.category_id) : '',
        is_active: !!data.is_active,
      });
      const cats = await getAdminCategories();
      setCategories(Array.isArray(cats) ? cats : (cats?.items ?? []));
    })();
  }, [id, reset]);

  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      category_id: Number(values.category_id),
      is_active: values.is_active ? 1 : 0,
    };
    await updateSubcategory(id, payload);
    navigate('/dashboard/subcategories', { replace: true });
  };

  const onDelete = async () => {
    await deleteSubcategory(id);
    navigate('/dashboard/subcategories', { replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-lg">دەستکاریکردنی ژێرپۆل</div>
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
          <div>
            <label className="text-sm">پۆل</label>
            <select className="w-full border rounded px-3 py-2" {...register('category_id')}>
              <option value="">-</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {formState.errors.category_id && <p className="text-red-600 text-sm">پێویستە</p>}
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <label className="flex items-center gap-2">
            <input type="checkbox" {...register('is_active')} />
            چالاک
          </label>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-black text-white" type="submit">پاشەکەوت</button>
          <button className="px-4 py-2 rounded border" type="button" onClick={() => navigate('/dashboard/subcategories')}>گەرانەوە</button>
        </div>
      </form>
    </div>
  );
}

export default SubcategoriesEdit;
