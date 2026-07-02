import {
  BarChart3, Bell, Building2, CalendarDays, ChevronDown, ChevronRight, FileArchive, FileText,
  GitBranch, HelpCircle, LayoutDashboard, LogOut, Menu, MessageSquare, Moon, Settings,
  Shield, ShieldAlert, Sun, User, Users, Workflow, X, Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { Avatar, Btn, RoleBadge, cn } from '../components/shared';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../permissions';
import * as flowdeskApi from '../../services/flowdeskApi';

const NAV_SECTIONS = [
  {
    label: 'Core',
    items: [
      { to: '/dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
      { to: '/requests',     label: 'Requests',         icon: FileText },
      { to: '/approvals',    label: 'Approvals',        icon: Shield },
      { to: '/tasks',        label: 'Tasks',            icon: Zap },
      { to: '/messages',     label: 'Messages',         icon: MessageSquare },
      { to: '/notifications',label: 'Notifications',    icon: Bell,          badge: 'unread' },
    ],
  },
  {
    label: 'Organisation',
    items: [
      { to: '/employees',    label: 'Employees',        icon: Users },
      { to: '/departments',  label: 'Departments',      icon: Building2 },
      { to: '/workflows',    label: 'Workflow Builder', icon: Workflow },
      { to: '/calendar',     label: 'Calendar',         icon: CalendarDays },
      { to: '/files',        label: 'Files',            icon: FileArchive },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/analytics',    label: 'Analytics',        icon: BarChart3 },
      { to: '/reports',      label: 'Reports',          icon: GitBranch },
      { to: '/audit-logs',   label: 'Audit Logs',       icon: ShieldAlert, permission: 'viewAuditLogs' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin',        label: 'Admin Console',    icon: Settings,      permission: 'viewAdmin' },
      { to: '/settings',     label: 'Settings',         icon: Settings },
      { to: '/profile',      label: 'Profile',          icon: User },
      { to: '/help',         label: 'Help',             icon: HelpCircle },
    ],
  },
];

function NavSection({ label, items, onNavigate, unreadCount, can, collapsed, onToggle }) {
  const visibleItems = items.filter((item) => !item.permission || can(item.permission));
  if (visibleItems.length === 0) return null;
  return (
    <div className="mb-1">
      <button
        className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        onClick={onToggle}
      >
        {label}
        {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
      </button>
      {!collapsed && (
        <div className="space-y-0.5">
          {visibleItems.map(({ to, label: itemLabel, icon: Icon, badge }) => {
            const showBadge = badge === 'unread' && unreadCount > 0;
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200',
                  )
                }
              >
                <span className="flex items-center gap-2.5">
                  <Icon size={15} className="flex-shrink-0" />
                  {itemLabel}
                </span>
                {showBadge ? (
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Sidebar({ onNavigate, unreadCount }) {
  const { can } = usePermissions();
  const [collapsed, setCollapsed] = useState({});
  function toggleSection(label) {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  }
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      {/* Brand */}
      <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">FlowDesk</h2>
            <p className="text-[10px] text-slate-400">Enterprise Automation</p>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_SECTIONS.map((section) => (
          <NavSection
            key={section.label}
            label={section.label}
            items={section.items}
            onNavigate={onNavigate}
            unreadCount={unreadCount}
            can={can}
            collapsed={!!collapsed[section.label]}
            onToggle={() => toggleSection(section.label)}
          />
        ))}
      </nav>
    </aside>
  );
}

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, darkMode, setDarkMode, logout } = useApp();
  const { role } = usePermissions();
  const navigate = useNavigate();

  // Poll notification count every 60s
  useEffect(() => {
    let mounted = true;
    async function fetchCount() {
      try {
        const res = await flowdeskApi.getUnreadCount();
        if (mounted) setUnreadCount(res?.count ?? 0);
      } catch {
        // ignore
      }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const name = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || 'User';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-slate-900">
        <button
          onClick={() => setSidebarOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700"
        >
          <Menu size={16} />
          Menu
        </button>
        <span className="text-sm font-semibold">FlowDesk</span>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-slate-950">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <span className="font-semibold">FlowDesk</span>
                <Btn variant="ghost" size="sm" className="px-2" onClick={() => setSidebarOpen(false)}>
                  <X size={16} />
                </Btn>
              </div>
              <Sidebar onNavigate={() => setSidebarOpen(false)} unreadCount={unreadCount} />
            </div>
          </div>
        )}

        {/* Sidebar (desktop) */}
        <div className="hidden lg:flex">
          <Sidebar onNavigate={() => {}} unreadCount={unreadCount} />
        </div>

        {/* Main content */}
        <main className="flex min-h-screen w-full flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-2.5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Welcome back, {user?.firstName || 'User'}
                </p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              {role ? <RoleBadge role={role} /> : null}
            </div>
            <div className="flex items-center gap-1.5">
              <Btn variant="ghost" size="sm" className="px-2" onClick={() => setDarkMode((v) => !v)} title="Toggle theme">
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </Btn>
              <NavLink
                to="/notifications"
                className="relative inline-flex items-center justify-center rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                title="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
              <NavLink
                to="/profile"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <Avatar name={name} size="sm" />
              </NavLink>
              <Btn variant="secondary" size="sm" onClick={handleLogout}>
                <LogOut size={14} />
                Logout
              </Btn>
            </div>
          </div>

          {/* Page content */}
          <div className="flex-1 p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
