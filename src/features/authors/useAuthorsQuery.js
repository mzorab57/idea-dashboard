import { useQuery } from '@tanstack/react-query';
import { getAdminAuthors } from '../../services/admin';

export function useAuthorsQuery(params) {
  return useQuery({
    queryKey: ['admin-authors', params],
    queryFn: () => getAdminAuthors(params),
    keepPreviousData: true,
  });
}
