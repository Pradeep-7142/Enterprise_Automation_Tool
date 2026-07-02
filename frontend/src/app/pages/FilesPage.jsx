import { FileArchive } from 'lucide-react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Card, EmptyState, PageHeader } from '../components/shared';

export default function FilesPage() {
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getFiles(), [], []);

  if (loading) return <PageLoader message="Loading files..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const files = data || [];
  return (
    <div className="space-y-5">
      <PageHeader title="Files" subtitle="Attached documents and supporting request assets." />
      {files.length === 0 ? (
        <EmptyState title="No files found" description="Uploaded request files will appear in this repository view." />
      ) : (
        <Card className="space-y-2">
          {files.map((file) => (
            <div key={file.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileArchive size={15} className="text-blue-600" />
                <span>{file.name || file.fileName || file.id}</span>
              </div>
              <span className="text-slate-500">{file.size || file.fileSize || '-'}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
