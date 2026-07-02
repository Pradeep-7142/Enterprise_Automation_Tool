import { Activity, BarChart3, Clock4, FileCheck2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Card, PageHeader, StatCard } from '../components/shared';

export default function DashboardPage() {
  const { data, loading, error, reload } = useFetch(
    async () => {
      const [dashboard, analytics] = await Promise.all([
        flowdeskApi.getDashboard(),
        flowdeskApi.getAnalytics(),
      ]);
      return { dashboard, analytics };
    },
    [],
    { dashboard: {}, analytics: {} },
  );

  if (loading) return <PageLoader message="Loading dashboard..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const dash = data.dashboard || {};
  const analytics = data.analytics || {};
  const trendData = analytics.trendData || [];
  const recentRequests = dash.recentRequests || [];
  const activityFeed = dash.activityFeed || [];

  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard" subtitle="Live operations view across your workflow pipeline." />
      <motion.div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <StatCard title="Total Requests" value={dash.totalRequests ?? 0} icon={FileCheck2} />
        <StatCard title="Pending Approvals" value={dash.pendingApprovals ?? 0} icon={Clock4} />
        <StatCard title="Recently Completed" value={dash.recentlyCompleted ?? 0} icon={Activity} />
        <StatCard title="My Requests" value={dash.myRequests ?? 0} icon={BarChart3} />
      </motion.div>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Request Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="submitted" stroke="#2563eb" fill="#93c5fd" name="Submitted" />
              <Area type="monotone" dataKey="approved" stroke="#059669" fill="#86efac" name="Approved" />
              <Area type="monotone" dataKey="rejected" stroke="#dc2626" fill="#fca5a5" name="Rejected" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Recent Requests</h3>
          <ul className="space-y-2 text-sm">
            {recentRequests.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-slate-500">{r.id} · {r.dept}</p>
                </div>
                <Badge tone={r.status}>{r.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold">Activity Feed</h3>
          <ul className="space-y-2 text-sm">
            {activityFeed.map((a) => (
              <li key={a.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                <span className="font-medium">{a.user}</span>{' '}
                <span className="text-slate-500">{a.action}</span>{' '}
                <span className="text-blue-600">{a.target}</span>
                <p className="text-xs text-slate-400 mt-1">{a.time}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
