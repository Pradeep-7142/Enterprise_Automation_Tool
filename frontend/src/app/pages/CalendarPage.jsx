import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useFetch, PageError, PageLoader } from '../../hooks/useFetch';
import * as flowdeskApi from '../../services/flowdeskApi';
import { Badge, Btn, Card, PageHeader } from '../components/shared';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const { data, loading, error, reload } = useFetch(() => flowdeskApi.getTasks(), [], []);

  const tasks = data || [];

  // Group tasks by date (YYYY-MM-DD)
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const key = t.dueDate.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const calDays = getCalendarDays(year, month);

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  if (loading) return <PageLoader message="Loading calendar…" />;
  if (error) return <PageError message={error} onRetry={reload} />;

  return (
    <div className="space-y-5">
      <PageHeader title="Calendar" subtitle="Upcoming due dates and task deadlines." />

      <Card>
        {/* Month header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{MONTHS[month]} {year}</h3>
          <div className="flex gap-1">
            <Btn variant="ghost" size="sm" className="px-2" onClick={prevMonth}><ChevronLeft size={16} /></Btn>
            <Btn variant="ghost" size="sm" className="px-2" onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }}>Today</Btn>
            <Btn variant="ghost" size="sm" className="px-2" onClick={nextMonth}><ChevronRight size={16} /></Btn>
          </div>
        </div>

        {/* Day headers */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {DAYS.map((d) => (
            <div key={d} className="py-1 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calDays.map((day, i) => {
            if (day === null) return <div key={`empty-${i}`} />;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasksByDate[dateKey] || [];
            const isToday = dateKey === today;
            const isPast = new Date(dateKey) < now && !isToday;
            return (
              <div
                key={dateKey}
                className={`min-h-[72px] rounded-lg border p-1.5 transition ${
                  isToday
                    ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20'
                    : isPast
                      ? 'border-slate-100 bg-slate-50/50 dark:border-slate-800/50 dark:bg-slate-900/30'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <p className={`text-xs font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>{day}</p>
                <div className="mt-1 space-y-0.5">
                  {dayTasks.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      title={t.title || t.name}
                      className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${
                        t.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}
                    >
                      {t.title || t.name || 'Task'}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <p className="text-[10px] text-slate-400">+{dayTasks.length - 2} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Legend + upcoming tasks */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-semibold">Upcoming Due Tasks</h3>
          {tasks
            .filter((t) => t.dueDate && new Date(t.dueDate) >= now && t.status !== 'completed')
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 8)
            .map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2.5 text-sm dark:border-slate-800 mb-2">
                <div>
                  <p className="font-medium">{t.title || t.name}</p>
                  <p className="text-xs text-slate-500">{t.assigneeName || t.assignee || 'Unassigned'}</p>
                </div>
                <span className="flex-shrink-0 text-xs font-medium text-blue-600">{new Date(t.dueDate).toLocaleDateString()}</span>
              </div>
            ))}
          {tasks.filter((t) => t.dueDate && new Date(t.dueDate) >= now && t.status !== 'completed').length === 0 && (
            <p className="text-sm text-slate-500">No upcoming due tasks.</p>
          )}
        </Card>
        <Card>
          <h3 className="mb-3 font-semibold">Overdue Tasks</h3>
          {tasks
            .filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed')
            .slice(0, 8)
            .map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-sm dark:border-rose-900/40 dark:bg-rose-900/10 mb-2">
                <p className="font-medium text-rose-700 dark:text-rose-400">{t.title || t.name}</p>
                <span className="text-xs font-medium text-rose-500">{new Date(t.dueDate).toLocaleDateString()}</span>
              </div>
            ))}
          {tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length === 0 && (
            <p className="text-sm text-slate-500">No overdue tasks. 🎉</p>
          )}
        </Card>
      </div>
    </div>
  );
}
