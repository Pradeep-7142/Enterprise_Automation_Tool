import { Download } from 'lucide-react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Btn, Card, EmptyState, PageHeader } from '../components/shared';

export default function ReportsPage() {
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getReports(), [], []);

  if (loading) return <PageLoader message="Loading reports..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const reports = data || [];
  return (
    <div className="space-y-5">
      <PageHeader title="Reports" subtitle="Generated compliance and operational report catalog." />
      {reports.length === 0 ? (
        <EmptyState title="No reports generated" description="Scheduled reports will be available here once generated." />
      ) : (
        <Card className="space-y-2">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
              <div>
                <p className="font-medium">{report.name || report.title || report.id}</p>
                <p className="text-slate-500">{report.period || report.createdAt || '-'}</p>
              </div>
              <Btn variant="secondary">
                <Download size={15} />
                Download
              </Btn>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
