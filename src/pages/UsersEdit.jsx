import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateUser, deleteUser, getAdminUsers } from '../services/admin';

const schema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().optional(),
  is_active: z.boolean().optional(),
});

function UsersEdit() {
  const { id } = useParams();
  const { register, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
  });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const list = await getAdminUsers();
      const user = Array.isArray(list) ? list.find((u) => String(u.id) === String(id)) : null;
      if (!user) return;
      reset({
        full_name: user.full_name,
        email: user.email,
        password: '',
        is_active: !!user.is_active,
      });
    })();
  }, [id, reset]);

  const onSubmit = async (values) => {
    const payload = {
      full_name: values.full_name,
      email: values.email,
      password: values.password || '',
      is_active: values.is_active ? 1 : 0,
    };
    await updateUser(id, payload);
    navigate('/dashboard/users', { replace: true });
  };

  const onDelete = async () => {
    await deleteUser(id);
    navigate('/dashboard/users', { replace: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-lg">دەستکاریکردنی فەرمانبەر</div>
        <button className="px-3 py-2 rounded border text-red-600" onClick={onDelete}>سڕینەوە</button>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm">ناو</label>
            <input className="w-full border rounded px-3 py-2" {...register('full_name')} />
            {formState.errors.full_name && <p className="text-red-600 text-sm">پێویستە</p>}
          </div>
          <div>
            <label className="text-sm">ئیمەیل</label>
            <input className="w-full border rounded px-3 py-2" type="email" {...register('email')} />
            {formState.errors.email && <p className="text-red-600 text-sm">ئیمەیل دروست نیە</p>}
          </div>
          <div>
            <label className="text-sm">وشەی نهێنی (ئیختیاری)</label>
            <input className="w-full border rounded px-3 py-2" type="password" {...register('password')} />
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
          <button className="px-4 py-2 rounded border" type="button" onClick={() => navigate('/dashboard/users')}>گەرانەوە</button>
        </div>
      </form>
    </div>
  );
}

export default UsersEdit;
