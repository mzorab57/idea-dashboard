import { useQuery } from '@tanstack/react-query';
import { getDashboardOverview } from '../../services/admin';

export function useOverviewQuery(days = 30) {
  return useQuery({
    queryKey: ['admin-stats-overview', days],
    queryFn: () => getDashboardOverview(days),
    keepPreviousData: true,
  });
}
