import { ArrowLeft, Bell, Building2, CalendarDays, FileArchive, FileText, GitBranch, HelpCircle, Home, LayoutDashboard, LogOut, Menu, MessageSquare, Moon, Settings, Shield, Sun, User, Users, Workflow } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { Avatar, Btn, cn } from '../components/shared';
import { useApp } from '../context/AppContext';
import { usePermissions } from '../permissions';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/requests', label: 'Requests', icon: FileText },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/workflows', label: 'Workflow Builder', icon: Workflow },
  { to: '/analytics', label: 'Analytics', icon: Home },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/departments', label: 'Departments', icon: Building2 },
  { to: '/tasks', label: 'Tasks', icon: CalendarDays },
  { to: '/approvals', label: 'Approvals', icon: Shield },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/files', label: 'Files', icon: FileArchive },
  { to: '/audit-logs', label: 'Audit Logs', icon: GitBranch, permission: 'viewAuditLogs' },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/admin', label: 'Admin', icon: Shield, permission: 'viewAdmin' },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/help', label: 'Help', icon: HelpCircle },
];

function Sidebar({ onNavigate }) {
  const { can } = usePermissions();
  const visibleItems = navItems.filter((item) => !item.permission || can(item.permission));
  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="border-b border-slate-200 p-4 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">FlowDesk</h2>
        <p className="text-xs text-slate-500">Enterprise Workflow Automation</p>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, darkMode, setDarkMode, logout } = useApp();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <button onClick={() => setSidebarOpen((prev) => !prev)} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-700">
          <Menu size={16} />
          Menu
        </button>
      </div>
      <div className="flex min-h-screen">
        <div className={cn('fixed inset-y-0 left-0 z-40 transition lg:static lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </div>
        <main className="w-full flex-1">
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex items-center gap-3">
              <Btn variant="ghost" className="px-2" onClick={() => navigate(-1)} aria-label="Go back" title="Go back">
                <ArrowLeft size={16} />
              </Btn>
              <div>
                <p className="text-sm font-medium">Welcome back</p>
                <p className="text-xs text-slate-500">{user?.email || 'Team workspace'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Btn variant="ghost" onClick={() => setDarkMode((value) => !value)}>
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </Btn>
              <NavLink to="/profile" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1 dark:border-slate-700">
                <Avatar name={user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'User'} />
              </NavLink>
              <Btn variant="secondary" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </Btn>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
