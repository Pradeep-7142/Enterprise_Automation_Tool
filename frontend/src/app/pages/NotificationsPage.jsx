import { Bell, BellOff, BellRing, Check } from 'lucide-react';
import { useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, EmptyState, FilterTabs, PageHeader, RelativeTime } from '../components/shared';

const FILTER_TABS = [
  { value: 'all',    label: 'All' },
  { value: 'unread', label: 'Unread' },
];

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getNotifications(), [], []);
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  async function markRead(id) {
    setMarkingId(id);
    try {
      await flowdeskApi.markNotificationRead(id);
      reload();
    } catch {}
    setMarkingId(null);
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await flowdeskApi.markAllNotificationsRead();
      reload();
    } catch {}
    setMarkingAll(false);
  }

  if (loading) return <PageLoader message="Loading notifications…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  const notifications = data || [];
  const unread = notifications.filter((n) => !n.read);
  const filtered = filter === 'unread' ? unread : notifications;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        subtitle="System events and approval updates from workflow operations."
        actions={
          unread.length > 0 ? (
            <Btn variant="secondary" size="sm" onClick={markAllRead} disabled={markingAll}>
              <Check size={14} />
              {markingAll ? 'Marking…' : `Mark all read (${unread.length})`}
            </Btn>
          ) : null
        }
      />

      <div className="flex items-center gap-3">
        <FilterTabs
          options={[
            { value: 'all', label: 'All', count: notifications.length },
            { value: 'unread', label: 'Unread', count: unread.length },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={filter === 'unread' ? 'All caught up!' : 'No notifications'}
          description={filter === 'unread' ? 'No unread notifications.' : 'Real-time events will appear here when workflows trigger updates.'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((notice) => (
            <div
              key={notice.id}
              className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                !notice.read
                  ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900/40 dark:bg-blue-900/10'
                  : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className={`mt-0.5 flex-shrink-0 ${!notice.read ? 'text-blue-500' : 'text-slate-400'}`}>
                {!notice.read ? <BellRing size={18} /> : <Bell size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-medium ${!notice.read ? '' : 'text-slate-600 dark:text-slate-400'}`}>
                    {notice.title || notice.type || 'Notification'}
                  </p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <RelativeTime date={notice.createdAt} />
                    {!notice.read ? (
                      <Btn
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => markRead(notice.id)}
                        disabled={markingId === notice.id}
                        title="Mark as read"
                      >
                        <Check size={13} />
                        {markingId === notice.id ? 'Marking…' : 'Mark read'}
                      </Btn>
                    ) : null}
                  </div>
                </div>
                {notice.message || notice.description ? (
                  <p className="mt-1 text-sm text-slate-500">{notice.message || notice.description}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
