import { Activity, AlertTriangle, BarChart3, Clock4, FileCheck2, Plus, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, PageHeader, RelativeTime, StatCard } from '../components/shared';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../permissions';

function QuickActions({ can }) {
  const actions = [
    { label: 'New Request', to: '/requests/new', icon: Plus, permission: 'createRequest', color: 'bg-blue-600 text-white hover:bg-blue-500' },
    { label: 'Review Approvals', to: '/approvals', icon: FileCheck2, permission: 'approveRequests', color: 'bg-emerald-600 text-white hover:bg-emerald-500' },
    { label: 'Add Member', to: '/employees', icon: Activity, permission: 'manageMembers', color: 'bg-purple-600 text-white hover:bg-purple-500' },
    { label: 'Analytics', to: '/analytics', icon: BarChart3, permission: 'viewAnalytics', color: 'bg-amber-600 text-white hover:bg-amber-500' },
  ].filter((a) => can(a.permission));

  if (actions.length === 0) return null;

  return (
    <Card>
      <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {actions.map((a) => (
          <Btn key={a.to} as={Link} to={a.to} className={a.color + ' flex-col gap-1 py-3 rounded-xl'}>
            <a.icon size={18} />
            <span className="text-xs font-medium">{a.label}</span>
          </Btn>
        ))}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useApp();
  const { can, role } = usePermissions();
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ORG_ADMIN';

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

  if (loading) return <PageLoader message="Loading dashboard…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const dash = data.dashboard || {};
  const analytics = data.analytics || {};
  const trendData = analytics.trendData || [];
  const recentRequests = dash.recentRequests || [];
  const activityFeed = dash.activityFeed || [];

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Good ${getTimeOfDay()}, ${user?.firstName || 'User'}`}
        subtitle="Here's what's happening across your organisation today."
      />

      {/* KPI Stats */}
      <motion.div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <StatCard
          title="Total Requests"
          value={dash.totalRequests ?? 0}
          icon={FileCheck2}
          color="blue"
          trend={dash.requestsTrend}
          trendLabel={dash.requestsTrendLabel}
        />
        <StatCard
          title="Pending Approvals"
          value={dash.pendingApprovals ?? 0}
          icon={Clock4}
          color="amber"
          hint={dash.pendingApprovals > 5 ? 'Needs attention' : undefined}
        />
        <StatCard
          title="Completed This Month"
          value={dash.recentlyCompleted ?? 0}
          icon={Activity}
          color="green"
        />
        <StatCard
          title="My Requests"
          value={dash.myRequests ?? 0}
          icon={BarChart3}
          color="purple"
        />
      </motion.div>

      {/* SLA Alert for admin */}
      {isAdmin && dash.overdueCount > 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-900/10">
          <AlertTriangle size={18} className="flex-shrink-0 text-amber-500" />
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            {dash.overdueCount} request{dash.overdueCount > 1 ? 's' : ''} overdue SLA.{' '}
            <Link to="/requests?status=overdue" className="underline">Review now →</Link>
          </p>
        </motion.div>
      ) : null}

      {/* Quick Actions */}
      <QuickActions can={can} />

      {/* Trend Chart */}
      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Request Trends (Last 6 Months)</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradSubmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend />
              <Area type="monotone" dataKey="submitted" stroke="#2563eb" fill="url(#gradSubmitted)" name="Submitted" strokeWidth={2} />
              <Area type="monotone" dataKey="approved" stroke="#059669" fill="url(#gradApproved)" name="Approved" strokeWidth={2} />
              <Area type="monotone" dataKey="rejected" stroke="#dc2626" fill="rgba(220,38,38,0.1)" name="Rejected" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Recent Requests + Activity Feed */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Recent Requests</h3>
            <Btn as={Link} to="/requests" variant="ghost" size="sm">View all →</Btn>
          </div>
          {recentRequests.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No recent requests.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentRequests.slice(0, 6).map((r) => (
                <li key={r.id}>
                  <Link
                    to={`/requests/${r.id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.title}</p>
                      <p className="text-xs text-slate-500">{r.id} · {r.dept}</p>
                    </div>
                    <Badge tone={r.status}>{r.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Activity Feed</h3>
            <Btn as={Link} to="/audit-logs" variant="ghost" size="sm">Full log →</Btn>
          </div>
          {activityFeed.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No recent activity.</p>
          ) : (
            <ul className="space-y-2">
              {activityFeed.slice(0, 6).map((a) => (
                <li key={a.id} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                  <div className="flex items-start justify-between gap-2">
                    <p>
                      <span className="font-medium">{a.user}</span>{' '}
                      <span className="text-slate-500">{a.action}</span>{' '}
                      <span className="text-blue-600">{a.target}</span>
                    </p>
                    <RelativeTime date={a.time || a.createdAt} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Pending tasks widget */}
      {can('createTask') && (
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Task Overview</h3>
            <Btn as={Link} to="/tasks" variant="secondary" size="sm">
              <Zap size={13} />
              View tasks
            </Btn>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Manage workflow-generated tasks assigned to your team from the Tasks page.
          </p>
        </Card>
      )}
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
