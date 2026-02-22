import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../../services/admin';

export function useStatsQuery() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: getDashboardStats,
  });
}
