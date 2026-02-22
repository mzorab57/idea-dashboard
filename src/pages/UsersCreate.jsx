import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUser } from '../services/admin';
import { useNavigate } from 'react-router-dom';

const schema = z.object({
  full_name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  is_active: z.boolean().optional(),
});

function UsersCreate() {
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { is_active: true },
  });
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    const payload = {
      full_name: values.full_name,
      email: values.email,
      password: values.password,
      is_active: values.is_active ? 1 : 0,
    };
    await createUser(payload);
    navigate('/dashboard/users', { replace: true });
  };

  return (
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
          <label className="text-sm">وشەی نهێنی</label>
          <input className="w-full border rounded px-3 py-2" type="password" {...register('password')} />
          {formState.errors.password && <p className="text-red-600 text-sm">کەمترە لە 6 پیت</p>}
        </div>
      </div>
      <div className="flex gap-6 items-center">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('is_active')} />
          چالاک
        </label>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded bg-black text-white" type="submit">زیادکردن</button>
        <button className="px-4 py-2 rounded border" type="button" onClick={() => navigate('/dashboard/users')}>گەرانەوە</button>
      </div>
    </form>
  );
}

export default UsersCreate;
