import { BellRing } from 'lucide-react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, EmptyState, PageHeader } from '../components/shared';

export default function NotificationsPage() {
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getNotifications(), [], []);

  async function markAllRead() {
    await flowdeskApi.markAllNotificationsRead();
    reload();
  }

  if (loading) return <PageLoader message="Loading notifications..." />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const notifications = data || [];
  return (
    <div className="space-y-5">
      <PageHeader title="Notifications" subtitle="System events and approval updates from workflow operations." />
      <Btn variant="secondary" onClick={markAllRead}>
        Mark all as read
      </Btn>
      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="Real-time events will appear here once workflows trigger updates." />
      ) : (
        <Card className="space-y-3">
          {notifications.map((notice) => (
            <div key={notice.id} className="flex items-start justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-start gap-3">
                <BellRing size={16} className="mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">{notice.title || notice.type || 'Notification'}</p>
                  <p className="text-sm text-slate-500">{notice.message || notice.description}</p>
                </div>
              </div>
              <Badge tone={notice.read ? 'approved' : 'pending'}>{notice.read ? 'Read' : 'Unread'}</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
