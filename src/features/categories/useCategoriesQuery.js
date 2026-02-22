import { useQuery } from '@tanstack/react-query';
import { getAdminCategories } from '../../services/admin';

export function useCategoriesQuery(params) {
  return useQuery({
    queryKey: ['admin-categories', params],
    queryFn: () => getAdminCategories(params),
    keepPreviousData: true,
  });
}
