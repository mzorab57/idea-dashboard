import { useQuery } from '@tanstack/react-query';
import { getAdminSubcategories } from '../../services/admin';

export function useSubcategoriesQuery(params) {
  return useQuery({
    queryKey: ['admin-subcategories', params],
    queryFn: () => getAdminSubcategories(params),
    keepPreviousData: true,
  });
}
