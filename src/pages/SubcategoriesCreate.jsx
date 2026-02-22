import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSubcategory, getAdminCategories } from '../services/admin';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  category_id: z.string().min(1),
  is_active: z.boolean().optional(),
});

function SubcategoriesCreate() {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
  });
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const data = await getAdminCategories();
      setCategories(Array.isArray(data) ? data : (data?.items ?? []));
    })();
  }, []);

  const onSubmit = async (values) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      category_id: Number(values.category_id),
      is_active: values.is_active ? 1 : 0,
    };
    await createSubcategory(payload);
    navigate('/dashboard/subcategories', { replace: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm">Name</label>
          <input className="w-full border rounded px-3 py-2" {...register('name')} />
          {formState.errors.name && <p className="text-red-600 text-sm">Required</p>}
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
          {formState.errors.category_id && <p className="text-red-600 text-sm">Required</p>}
        </div>
      </div>
      <div className="flex gap-6 items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('is_active')} />
          Active
        </label>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded bg-black text-white" type="submit">Add</button>
        <button className="px-4 py-2 rounded border" type="button" onClick={() => navigate('/dashboard/subcategories')}>Back</button>
      </div>
    </form>
  );
}

export default SubcategoriesCreate;
