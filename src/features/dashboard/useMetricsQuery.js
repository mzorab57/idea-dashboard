import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '../../services/admin';

export function useMetricsQuery(type, period = '1d') {
  return useQuery({
    queryKey: ['admin-stats-metrics', type, period],
    queryFn: () => getDashboardMetrics(type, period),
    select: (res) => ({ count: Number(res?.count ?? 0) }),
    keepPreviousData: true,
  });
}
