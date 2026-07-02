import { Download } from 'lucide-react';
import { useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Btn, Card, FilterTabs, PageHeader, StatCard } from '../components/shared';
import { usePermissions } from '../permissions';

const CHART_COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626'];

const DATE_TABS = [
  { value: '7d',   label: 'Last 7 days' },
  { value: '30d',  label: 'Last 30 days' },
  { value: '90d',  label: 'Last 90 days' },
  { value: '12m',  label: 'Last 12 months' },
];

export default function AnalyticsPage() {
  const { can } = usePermissions();
  const [range, setRange] = useState('30d');

  const { data, loading, error, reload } = useFetch(
    () => flowdeskApi.getAnalytics({ range }),
    [range],
    {},
  );

  function exportCSV() {
    const trendData = data?.trendData || [];
    if (!trendData.length) return;
    const headers = Object.keys(trendData[0]);
    const rows = trendData.map((row) => headers.map((h) => row[h] ?? '').join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <PageLoader message="Loading analytics…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const deptData = data?.deptData || [];
  const trendData = data?.trendData || [];
  const statusDist = data?.statusDist || [];
  const approvalTimeData = data?.approvalTimeData || [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Analytics"
        subtitle="Operational insights, throughput, and bottleneck trends."
        actions={
          <Btn variant="secondary" size="sm" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </Btn>
        }
      />

      {/* Date range filter */}
      <FilterTabs options={DATE_TABS} value={range} onChange={setRange} />

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Submitted" value={data?.totalSubmitted ?? 0} color="blue" />
        <StatCard title="Approved" value={data?.totalApproved ?? 0} color="green" />
        <StatCard title="Rejected" value={data?.totalRejected ?? 0} color="rose" />
        <StatCard title="Avg Approval (days)" value={data?.avgApprovalDays ?? 0} color="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Volume */}
        <Card>
          <h3 className="mb-3 font-semibold">Volume — {DATE_TABS.find((d) => d.value === range)?.label}</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend />
                <Bar dataKey="submitted" fill="#2563eb" name="Submitted" radius={[3, 3, 0, 0]} />
                <Bar dataKey="approved" fill="#059669" name="Approved" radius={[3, 3, 0, 0]} />
                <Bar dataKey="rejected" fill="#dc2626" name="Rejected" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Status Distribution */}
        <Card>
          <h3 className="mb-3 font-semibold">Status Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50}>
                  {statusDist.map((entry, i) => (
                    <Cell key={entry.name} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Department Performance */}
      <Card>
        <h3 className="mb-3 font-semibold">Department Performance</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={deptData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="dept" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend />
              <Bar dataKey="requests" fill="#2563eb" name="Total" radius={[0, 3, 3, 0]} />
              <Bar dataKey="approved" fill="#059669" name="Approved" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Approval Time */}
      {approvalTimeData.length > 0 && (
        <Card>
          <h3 className="mb-3 font-semibold">Approval Time Distribution</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {approvalTimeData.map((row) => (
              <div key={row.name} className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
                <p className="text-xs text-slate-500">{row.name}</p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{row.value}%</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
