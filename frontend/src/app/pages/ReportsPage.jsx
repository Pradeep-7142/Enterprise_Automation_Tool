import { Download, FileBarChart, Plus } from 'lucide-react';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, EmptyState, Modal, PageHeader, RelativeTime, inputCls, labelCls, selectCls } from '../components/shared';
import { usePermissions } from '../permissions';

const REPORT_TYPES = [
  { value: 'workflow_summary',    label: 'Workflow Summary' },
  { value: 'approval_times',      label: 'Approval Time Analysis' },
  { value: 'department_activity', label: 'Department Activity' },
  { value: 'user_activity',       label: 'User Activity' },
  { value: 'compliance',          label: 'Compliance Report' },
];

function GenerateReportModal({ onClose, onGenerated }) {
  const [form, setForm] = useState({ type: 'workflow_summary', startDate: '', endDate: '', name: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await flowdeskApi.generateReport({
        type: form.type,
        name: form.name || REPORT_TYPES.find((r) => r.value === form.type)?.label,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });
      onGenerated();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open onClose={onClose} title="Generate Report">
      <form onSubmit={submit} className="grid gap-4">
        <label className={labelCls}>
          Report Type *
          <select className={selectCls} value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
            {REPORT_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </label>
        <label className={labelCls}>
          Report Name (optional)
          <input className={inputCls} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Auto-generated if blank" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className={labelCls}>
            Start Date
            <input type="date" className={inputCls} value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
          </label>
          <label className={labelCls}>
            End Date
            <input type="date" className={inputCls} value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
          </label>
        </div>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Btn type="button" variant="secondary" onClick={onClose} disabled={busy}>Cancel</Btn>
          <Btn type="submit" disabled={busy}>{busy ? 'Generating…' : 'Generate report'}</Btn>
        </div>
      </form>
    </Modal>
  );
}

export default function ReportsPage() {
  const { can } = usePermissions();
  const canCreate = can('createReport');
  const [showGenerate, setShowGenerate] = useState(false);
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getReports(), [], []);

  async function handleDownload(report) {
    try {
      const res = await flowdeskApi.downloadReport(report.id);
      if (res?.url) {
        const a = document.createElement('a');
        a.href = res.url;
        a.download = `${report.name || 'report'}.pdf`;
        a.click();
      }
    } catch {}
  }

  if (loading) return <PageLoader message="Loading reports…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const reports = data || [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        subtitle="Generated compliance and operational report catalog."
        actions={
          canCreate ? (
            <Btn onClick={() => setShowGenerate(true)}>
              <Plus size={15} /> Generate report
            </Btn>
          ) : null
        }
      />

      {reports.length === 0 ? (
        <EmptyState
          title="No reports generated"
          description="Scheduled and on-demand reports will appear here once generated."
          action={canCreate ? <Btn onClick={() => setShowGenerate(true)}><Plus size={15} />Generate report</Btn> : null}
        />
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <Card key={report.id} className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileBarChart size={16} className="text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{report.name || report.title || report.id}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{report.period || report.type || '—'}</span>
                    <span>·</span>
                    <RelativeTime date={report.createdAt} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge tone={report.status || 'active'}>{report.status || 'ready'}</Badge>
                <Btn variant="secondary" size="sm" onClick={() => handleDownload(report)}>
                  <Download size={13} /> Download
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showGenerate && <GenerateReportModal onClose={() => setShowGenerate(false)} onGenerated={reload} />}
    </div>
  );
}
