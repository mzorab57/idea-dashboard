import { Book, Download, Eye, TrendingUp, BarChart3, Activity, Users } from 'lucide-react';
import { useActivityQuery } from '../features/dashboard/useActivityQuery';
import { useMetricsQuery } from '../features/dashboard/useMetricsQuery';
import { useOverviewQuery } from '../features/dashboard/useOverviewQuery';
import { useStatsQuery } from '../features/dashboard/useStatsQuery';
import { useState, useEffect, useRef } from 'react';

// Enhanced StatCard with beautiful period selector
function StatCard(props) {
  const { icon, label, value, colorClass, isLoading, filterable, period, onPeriodChange, trend } = props;
  const IconComp = icon;
  const periods = ['1d', '7d', '30d', 'total'];
  
  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-100 shadow-xl shadow-gray-200/50 p-6 transition-all duration-300 ">
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-r from-primary to-secondary" />
      
      {/* Period selector - positioned at top right */}
      {filterable && (
        <div className="absolute bottom-4 right-4 z-10 ">
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full p-1 flex gap-1 ">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange?.(p)}
                disabled={isLoading}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                  period === p
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {p === 'total' ? 'All' : p}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="relative mt-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 tracking-wide mb-2">{label}</p>
            <h3 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tighter">
              {isLoading ? (
                <div className="h-10 w-24 animate-pulse rounded-xl bg-gray-200" />
              ) : (
                Number(value).toLocaleString()
              )}
            </h3>
            {trend && (
              <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                <TrendingUp size={16} className="transition-transform group-hover:translate-y-[-2px]" />
                <span>{trend}</span>
              </div>
            )}
          </div>
          
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${colorClass} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            <IconComp size={26} className="transition-transform duration-300 group-hover:scale-110" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardOverview() {
  const [periods, setPeriods] = useState({
    books: 'total',
    downloads: '7d',
    views: '1d'
  });
  
  const { data: booksMetrics, isLoading: booksLoading } = useMetricsQuery('books', periods.books);
  const { data: downloadsMetrics, isLoading: downloadsLoading } = useMetricsQuery('downloads', periods.downloads);
  const { data: viewsMetrics, isLoading: viewsLoading } = useMetricsQuery('views', periods.views);
  const { data: activity, isLoading: activityLoading } = useActivityQuery();
  const { data: statsSummary, isLoading: statsLoading } = useStatsQuery();
  
  console.log(booksMetrics);
  
  const handlePeriodChange = (stat, period) => {
    setPeriods(prev => ({ ...prev, [stat]: period }));
  };

  const formatTime = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return '—';
    }
  };

  const stats = [
    {
      key: 'books',
      label: "Total Books",
      value: booksMetrics?.count ?? 0,
      icon: Book,
      colorClass: "bg-gradient-to-br from-indigo-500 to-indigo-600 text-white",
      trend: "Live data",
      filterable: false
    },
    {
      key: 'authors',
      label: "Total Authors",
      value: statsSummary?.total_authors ?? 0,
      icon: Users,
      colorClass: "bg-gradient-to-br from-purple-500 to-purple-600 text-white",
      trend: "Live data",
      filterable: false
    },
    {
      key: 'downloads',
      label: "Downloads",
      value: downloadsMetrics?.count ?? 0,
      icon: Download,
      colorClass: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
      trend: "Live data",
      filterable: true
    },
    {
      key: 'views',
      label: "Views",
      value: viewsMetrics?.count ?? 0,
      icon: Eye,
      colorClass: "bg-gradient-to-br from-blue-500 to-blue-600 text-white",
      trend: "Live data",
      filterable: true
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-lg text-gray-500">Monitor your platform's performance and activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard
              key={stat.key}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              colorClass={stat.colorClass}
              isLoading={booksLoading || downloadsLoading || viewsLoading || statsLoading}
              filterable={stat.filterable}
              period={periods[stat.key]}
              onPeriodChange={(p) => handlePeriodChange(stat.key, p)}
              trend={stat.trend}
            />
          ))}
        </div>

        {/* Charts & Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overview Chart */}
          <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8 transition-all hover:shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <BarChart3 size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Performance Overview</h2>
                <p className="text-gray-500">Monthly analytics and trends</p>
              </div>
            </div>
            <OverviewChart />
          </div>

          {/* Recent Activity */}
          <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8 transition-all hover:shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Activity size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                <p className="text-gray-500">Latest platform interactions</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-11 h-11 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Download className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {activityLoading ? 'Loading...' : (activity?.recent_download ? 'Book downloaded' : 'No recent downloads')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activityLoading ? '—' : (activity?.recent_download ? `“${activity.recent_download.title}” (${activity.recent_download.count} times)` : 'No downloads in the last 24 hours')}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {activityLoading ? '—' : formatTime(activity?.recent_download?.last_at)}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Eye className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Page views spike</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activityLoading ? '—' : `${activity?.views_last_hour?.count ?? 0} views in the last hour`}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {activityLoading ? '—' : formatTime(activity?.views_last_hour?.last_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}



export default DashboardOverview;
 
function OverviewChart() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useOverviewQuery(days);
  const items = Array.isArray(data?.items) ? data.items : [];
  const maxVal = items.reduce((m, it) => Math.max(m, Number(it.views || 0), Number(it.downloads || 0)), 0) || 1;
  const containerRef = useRef(null);
  const [width, setWidth] = useState(640);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w > 0) setWidth(Math.max(320, w - 16));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const height = 300;
  const padding = 24;
  const step = items.length > 1 ? (width - padding * 2) / (items.length - 1) : 0;
  const yScale = (val) => {
    const v = Number(val || 0);
    const h = ((height - padding * 2) * v) / maxVal;
    return height - padding - h;
  };
  const points = items.map((it, i) => [padding + i * step, yScale(it.views)]);
  const path = points.reduce((acc, [x, y], i) => acc + (i === 0 ? `M${x},${y}` : ` L${x},${y}`), '');
  return (
    <div ref={containerRef} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row items-start  lg:items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-sm text-gray-700">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            Views
          </span>
          <span className="inline-flex items-center gap-1 text-sm text-gray-700">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            Downloads
          </span>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full p-1 flex gap-1">
          {[7, 14, 30, 60].map((d) => (
            <button
              key={d}
              className={`px-3 py-1 text-xs rounded-full ${days === d ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setDays(d)}
              disabled={isLoading}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>
      <div className="relative overflow-x-auto">
        {isLoading ? (
          <div className="h-72 flex items-center justify-center text-gray-400">Loading chart...</div>
        ) : items.length === 0 ? (
          <div className="h-72 flex items-center justify-center text-gray-400">No data</div>
        ) : (
          <svg width={width} height={height} className="block mx-auto">
            <defs>
              <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.01" />
              </linearGradient>
            </defs>
            <path d={path} stroke="#3b82f6" strokeWidth="2.5" fill="none" />
            {points.length > 1 && (
              <path
                d={`${path} L${padding + (items.length - 1) * step},${height - padding} L${padding},${height - padding} Z`}
                fill="url(#viewsGradient)"
              />
            )}
            {items.map((it, i) => {
              const x = padding + i * step;
              const barH = ((height - padding * 2) * Number(it.downloads || 0)) / maxVal;
              const barY = height - padding - barH;
              const barW = Math.max(4, step * 0.6);
              return (
                <rect
                  key={i}
                  x={x - barW / 2}
                  y={barY}
                  width={barW}
                  height={barH}
                  rx="3"
                  fill="#10b981"
                  opacity="0.8"
                />
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
