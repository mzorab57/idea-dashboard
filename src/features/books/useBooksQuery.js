import { useQuery } from '@tanstack/react-query';
import { getAdminBooks } from '../../services/admin';

export function useBooksQuery(params) {
  return useQuery({
    queryKey: ['admin-books', params],
    queryFn: () => getAdminBooks(params),
    keepPreviousData: true,
  });
}
