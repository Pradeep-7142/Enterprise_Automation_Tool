import { Link } from 'react-router';

export function cn(...values) {
  return values.filter(Boolean).join(' ');
}

const statusStyles = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  rejected: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  in_review: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  inactive: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
};

export function Badge({ children, tone = 'default', className = '' }) {
  const toneClass = statusStyles[tone] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200';
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-1 text-xs font-medium', toneClass, className)}>
      {children}
    </span>
  );
}

export function Btn({ children, variant = 'primary', className = '', as: As = 'button', ...rest }) {
  const variantClass =
    variant === 'ghost'
      ? 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
      : variant === 'secondary'
        ? 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
        : 'bg-blue-600 text-white hover:bg-blue-500';
  return (
    <As
      className={cn('inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition', variantClass, className)}
      {...rest}
    >
      {children}
    </As>
  );
}

export function Card({ children, className = '' }) {
  return <section className={cn('rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>{children}</section>;
}

export function Avatar({ src, name = 'User', initials }) {
  if (src) return <img src={src} alt={name} className="h-9 w-9 rounded-full object-cover" />;
  const label = initials || name.split(' ').map((chunk) => chunk[0]).slice(0, 2).join('').toUpperCase();
  return <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">{label}</div>;
}

export function StatCard({ title, value, hint, icon: Icon }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">{title}</p>
          <h3 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</h3>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {Icon ? <Icon size={18} className="text-blue-500" /> : null}
      </div>
    </Card>
  );
}

export function PageHeader({ title, subtitle, actionLabel, actionTo, actionIcon: Icon }) {
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {actionLabel && actionTo ? (
        <Btn as={Link} to={actionTo}>
          {Icon ? <Icon size={16} /> : null}
          {actionLabel}
        </Btn>
      ) : null}
    </header>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <Card className="py-10 text-center">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </Card>
  );
}
