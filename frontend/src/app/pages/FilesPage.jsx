import { Download, FileArchive, FileImage, FileText, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, ConfirmDialog, EmptyState, PageHeader, RelativeTime, SearchInput } from '../components/shared';
import { usePermissions } from '../permissions';

function fileIcon(name = '') {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return <FileImage size={16} className="text-blue-500" />;
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) return <FileText size={16} className="text-amber-500" />;
  return <FileArchive size={16} className="text-slate-500" />;
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FilesPage() {
  const { can } = usePermissions();
  const canUpload = can('uploadFile');
  const canDelete = can('deleteFile');

  const [search, setSearch] = useState('');
  const [deleteFile, setDeleteFile] = useState(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef(null);

  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getFiles(), [], []);

  const files = (data || []).filter((f) => {
    const q = search.toLowerCase();
    return !q || (f.name || f.fileName || '').toLowerCase().includes(q);
  });

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await flowdeskApi.uploadFile(formData);
      reload();
    } catch {}
    setUploading(false);
    e.target.value = '';
  }

  async function handleDelete() {
    setDeleteBusy(true);
    try {
      await flowdeskApi.deleteFile(deleteFile.id);
      setDeleteFile(null);
      reload();
    } catch {}
    setDeleteBusy(false);
  }

  async function handleDownload(file) {
    try {
      const res = await flowdeskApi.getFileDownloadUrl(file.id);
      if (res?.url) {
        const a = document.createElement('a');
        a.href = res.url;
        a.download = file.name || file.fileName || 'file';
        a.click();
      }
    } catch {}
  }

  if (loading) return <PageLoader message="Loading files…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Files"
        subtitle="Attached documents and supporting request assets."
        actions={
          canUpload ? (
            <>
              <Btn onClick={() => fileInput.current?.click()} disabled={uploading}>
                <Upload size={15} />
                {uploading ? 'Uploading…' : 'Upload file'}
              </Btn>
              <input ref={fileInput} type="file" className="hidden" onChange={handleUpload} />
            </>
          ) : null
        }
      />

      <div className="flex items-center gap-3">
        <SearchInput className="max-w-sm" value={search} onChange={setSearch} placeholder="Search files…" />
        <span className="text-sm text-slate-500">{files.length} files</span>
      </div>

      {files.length === 0 ? (
        <EmptyState
          title="No files found"
          description="Upload request files or attach documents to workflow requests."
          action={canUpload ? <Btn onClick={() => fileInput.current?.click()}><Upload size={15} />Upload file</Btn> : null}
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">File</th>
                <th className="px-4 py-3 font-medium">Size</th>
                <th className="px-4 py-3 font-medium">Uploaded</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => {
                const name = file.name || file.fileName || file.id;
                return (
                  <tr key={file.id} className="border-t border-slate-200 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {fileIcon(name)}
                        <span className="font-medium truncate max-w-[240px]">{name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatSize(file.size || file.fileSize)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {file.uploadedAt || file.createdAt
                        ? new Date(file.uploadedAt || file.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Btn size="sm" variant="ghost" onClick={() => handleDownload(file)} title="Download">
                          <Download size={13} />
                        </Btn>
                        {canDelete ? (
                          <Btn size="sm" variant="ghost" className="text-rose-500" onClick={() => setDeleteFile(file)} title="Delete">
                            <Trash2 size={13} />
                          </Btn>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <ConfirmDialog
        open={!!deleteFile}
        onClose={() => setDeleteFile(null)}
        onConfirm={handleDelete}
        title="Delete File"
        message={`Permanently delete "${deleteFile?.name || deleteFile?.fileName}"?`}
        confirmLabel="Delete"
        variant="danger"
        busy={deleteBusy}
      />
    </div>
  );
}
