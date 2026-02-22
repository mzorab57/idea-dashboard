import { useQuery } from '@tanstack/react-query';
import { getAdminUsers } from '../../services/admin';

export function useUsersQuery() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminUsers,
  });
}
