import { AlertTriangle, ArrowDown, ArrowLeft, ArrowUp, Check, Loader2, Minus, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ROLE_COLORS, ROLE_LABELS } from '../permissions';

/* ─── Utility ─────────────────────────────────────────────────────────────── */

export function cn(...values) {
  return values.filter(Boolean).join(' ');
}

/* ─── Badge ───────────────────────────────────────────────────────────────── */

const statusStyles = {
  pending:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected:  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  in_review: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  active:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  inactive:  'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  draft:     'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  low:       'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  medium:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  high:      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  critical:  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

export function Badge({ children, tone = 'default', className = '' }) {
  const toneClass = statusStyles[tone] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', toneClass, className)}>
      {children}
    </span>
  );
}

/* ─── Role Badge ──────────────────────────────────────────────────────────── */

export function RoleBadge({ role, className = '' }) {
  const label = ROLE_LABELS[role] || role?.replace(/_/g, ' ') || 'Unknown';
  const colorClass = ROLE_COLORS[role] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', colorClass, className)}>
      {label}
    </span>
  );
}

/* ─── Button ──────────────────────────────────────────────────────────────── */

export function Btn({ children, variant = 'primary', className = '', as: As = 'button', size = 'md', ...rest }) {
  const variantClass =
    variant === 'ghost'
      ? 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
      : variant === 'secondary'
        ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
        : variant === 'danger'
          ? 'bg-rose-600 text-white hover:bg-rose-500'
          : variant === 'success'
            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
            : 'bg-blue-600 text-white hover:bg-blue-500';
  const sizeClass = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm';
  return (
    <As
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClass,
        variantClass,
        className,
      )}
      {...rest}
    >
      {children}
    </As>
  );
}

/* ─── Card ────────────────────────────────────────────────────────────────── */

export function Card({ children, className = '' }) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
      {children}
    </section>
  );
}

/* ─── Avatar ──────────────────────────────────────────────────────────────── */

export function Avatar({ src, name = 'User', initials, size = 'md' }) {
  const sizeClass = size === 'lg' ? 'h-12 w-12 text-sm' : size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs';
  if (src) return <img src={src} alt={name} className={cn(sizeClass, 'rounded-full object-cover')} />;
  const label = initials || name.split(' ').map((chunk) => chunk[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className={cn('flex items-center justify-center rounded-full bg-blue-600 font-semibold text-white', sizeClass)}>
      {label}
    </div>
  );
}

/* ─── Stat Card ───────────────────────────────────────────────────────────── */

export function StatCard({ title, value, hint, icon: Icon, trend, trendLabel, color = 'blue' }) {
  const colorMap = {
    blue:   { icon: 'text-blue-500', trend_up: 'text-emerald-600', trend_down: 'text-rose-600' },
    green:  { icon: 'text-emerald-500', trend_up: 'text-emerald-600', trend_down: 'text-rose-600' },
    amber:  { icon: 'text-amber-500', trend_up: 'text-emerald-600', trend_down: 'text-rose-600' },
    rose:   { icon: 'text-rose-500', trend_up: 'text-emerald-600', trend_down: 'text-rose-600' },
    purple: { icon: 'text-purple-500', trend_up: 'text-emerald-600', trend_down: 'text-rose-600' },
  };
  const c = colorMap[color] || colorMap.blue;
  const TrendIcon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
  const trendClass = trend === 'up' ? c.trend_up : trend === 'down' ? c.trend_down : 'text-slate-400';
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</h3>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? <div className={cn('flex-shrink-0 rounded-lg bg-slate-50 p-2 dark:bg-slate-800', c.icon)}><Icon size={18} /></div> : null}
      </div>
      {trend && trendLabel ? (
        <div className={cn('mt-2 flex items-center gap-1 text-xs font-medium', trendClass)}>
          <TrendIcon size={12} />
          {trendLabel}
        </div>
      ) : null}
    </Card>
  );
}

/* ─── Back Button ─────────────────────────────────────────────────────────── */

export function BackButton({ className = '', fallback = -1 }) {
  const navigate = useNavigate();
  return (
    <Btn
      variant="ghost"
      className={cn('px-2', className)}
      onClick={() => navigate(fallback)}
      aria-label="Go back"
      title="Go back"
    >
      <ArrowLeft size={16} />
      Back
    </Btn>
  );
}

/* ─── Page Header ─────────────────────────────────────────────────────────── */

export function PageHeader({ title, subtitle, actionLabel, actionTo, actionIcon: Icon, back = false, actions }) {
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-2">
        {back ? <BackButton className="mt-0.5" /> : null}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {actions}
        {actionLabel && actionTo ? (
          <Btn as={Link} to={actionTo}>
            {Icon ? <Icon size={16} /> : null}
            {actionLabel}
          </Btn>
        ) : null}
      </div>
    </header>
  );
}

/* ─── Empty State ─────────────────────────────────────────────────────────── */

export function EmptyState({ title, description, action }) {
  return (
    <Card className="py-12 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Minus size={20} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}

/* ─── Search Input ────────────────────────────────────────────────────────── */

export function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }) {
  return (
    <div className={cn('relative', className)}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
    </div>
  );
}

/* ─── Filter Tabs ─────────────────────────────────────────────────────────── */

export function FilterTabs({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition',
            value === opt.value
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-100'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
          )}
        >
          {opt.label}
          {opt.count != null ? (
            <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] dark:bg-slate-700">
              {opt.count}
            </span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/* ─── Modal ───────────────────────────────────────────────────────────────── */

export function Modal({ open, onClose, title, children, width = 'max-w-lg' }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* panel */}
      <div
        ref={ref}
        className={cn(
          'relative z-10 w-full rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900',
          width,
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <Btn variant="ghost" size="sm" className="px-2" onClick={onClose} aria-label="Close">
            <X size={16} />
          </Btn>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

/* ─── Confirm Dialog ──────────────────────────────────────────────────────── */

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', variant = 'danger', busy = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-amber-500" />
          <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Btn variant="secondary" onClick={onClose} disabled={busy}>Cancel</Btn>
          <Btn variant={variant} onClick={onConfirm} disabled={busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : null}
            {confirmLabel}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

/* ─── Reason Modal (approve / reject with comment) ────────────────────────── */

export function ReasonModal({ open, onClose, onSubmit, title, placeholder = 'Add a comment (optional)…', confirmLabel = 'Submit', variant = 'primary', busy = false }) {
  const [reason, setReason] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(reason);
  }

  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder={placeholder}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <Btn type="button" variant="secondary" onClick={onClose} disabled={busy}>Cancel</Btn>
          <Btn type="submit" variant={variant} disabled={busy}>
            {busy ? <Loader2 size={14} className="animate-spin" /> : null}
            {confirmLabel}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

/* ─── Inline Spinner ──────────────────────────────────────────────────────── */

export function Spinner({ size = 16, className = '' }) {
  return <Loader2 size={size} className={cn('animate-spin text-blue-500', className)} />;
}

/* ─── Time relative ───────────────────────────────────────────────────────── */

export function RelativeTime({ date }) {
  if (!date) return <span className="text-slate-400">—</span>;
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  let label;
  if (mins < 1) label = 'just now';
  else if (mins < 60) label = `${mins}m ago`;
  else if (hours < 24) label = `${hours}h ago`;
  else if (days < 7) label = `${days}d ago`;
  else label = d.toLocaleDateString();
  return <span title={d.toLocaleString()} className="text-xs text-slate-500">{label}</span>;
}

/* ─── Section Header ──────────────────────────────────────────────────────── */

export function SectionHeader({ title, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h3>
      {action}
    </div>
  );
}

/* ─── Input + Textarea helpers ────────────────────────────────────────────── */

export const inputCls =
  'mt-1 w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500';

export const selectCls =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500';

export const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300';

/* ─── Priority Badge ──────────────────────────────────────────────────────── */

export function PriorityBadge({ priority }) {
  return <Badge tone={priority}>{priority || 'medium'}</Badge>;
}

/* ─── Check icon ──────────────────────────────────────────────────────────── */

export function SuccessIcon({ size = 16 }) {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
      <Check size={size - 2} className="text-emerald-600" />
    </span>
  );
}
