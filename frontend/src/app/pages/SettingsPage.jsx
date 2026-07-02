import { Moon, Sun } from 'lucide-react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Btn, Card, PageHeader } from '../components/shared';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { darkMode, setDarkMode } = useApp();
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getUnreadCount(), [], {});

  if (loading) return <PageLoader message="Loading settings..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" subtitle="Personal and workspace-level preferences." />
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Theme mode</p>
            <p className="text-sm text-slate-500">Switch between light and dark workspace themes.</p>
          </div>
          <Btn variant="secondary" onClick={() => setDarkMode((v) => !v)}>
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            {darkMode ? 'Light mode' : 'Dark mode'}
          </Btn>
        </div>
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
          <p className="font-medium">Unread notifications</p>
          <p className="text-slate-500">{data?.count ?? 0} pending updates</p>
        </div>
      </Card>
    </div>
  );
}
