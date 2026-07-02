import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Card, PageHeader, StatCard } from '../components/shared';

const CHART_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];

export default function AnalyticsPage() {
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getAnalytics(), [], {});

  if (loading) return <PageLoader message="Loading analytics..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const deptData = data?.deptData || [];
  const trendData = data?.trendData || [];
  const statusDist = data?.statusDist || [];
  const approvalTimeData = data?.approvalTimeData || [];

  return (
    <div className="space-y-5">
      <PageHeader title="Analytics" subtitle="Operational insights, throughput, and bottleneck trends." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Submitted" value={data?.totalSubmitted ?? 0} />
        <StatCard title="Approved" value={data?.totalApproved ?? 0} />
        <StatCard title="Rejected" value={data?.totalRejected ?? 0} />
        <StatCard title="Avg Approval Days" value={data?.avgApprovalDays ?? 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Monthly Volume</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="submitted" fill="#2563eb" name="Submitted" />
                <Bar dataKey="approved" fill="#059669" name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="mb-3 font-semibold">Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {statusDist.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-semibold">Department Performance</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dept" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="requests" fill="#2563eb" name="Total" />
              <Bar dataKey="approved" fill="#059669" name="Approved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 font-semibold">Approval Time Distribution</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {approvalTimeData.map((row) => (
            <div key={row.name} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
              <span>{row.name}</span>
              <span className="font-semibold">{row.value}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
