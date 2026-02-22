import { useQuery } from '@tanstack/react-query';
import { getDashboardActivity } from '../../services/admin';

export function useActivityQuery() {
  return useQuery({
    queryKey: ['admin-stats-activity'],
    queryFn: getDashboardActivity,
    keepPreviousData: true,
  });
}
