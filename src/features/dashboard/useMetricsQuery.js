import { useQuery } from '@tanstack/react-query';
import { getDashboardMetrics } from '../../services/admin';

export function useMetricsQuery(type, period = '1d') {
  return useQuery({
    queryKey: ['admin-stats-metrics', type, period],
    queryFn: () => getDashboardMetrics(period),
    select: (res) => {
      if (!res || typeof res !== 'object') return { count: 0 };
      if (Array.isArray(res.items)) {
        const found = res.items.find(
          (it) => it?.key === type || it?.name === type || it?.type === type
        );
        if (found && typeof found.count !== 'undefined') {
          return { count: Number(found.count) || 0 };
        }
      }
      if (res[type] != null) {
        const v = res[type];
        if (typeof v === 'number') return { count: v };
        if (typeof v === 'object' && v && typeof v.count !== 'undefined') {
          return { count: Number(v.count) || 0 };
        }
      }
      if (typeof res.counts === 'object' && res.counts && res.counts[type] != null) {
        const v = res.counts[type];
        return { count: Number(v) || 0 };
      }
      return { count: 0 };
    },
    keepPreviousData: true,
  });
}
