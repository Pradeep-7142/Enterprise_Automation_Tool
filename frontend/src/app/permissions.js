import { useApp } from './context/AppContext';

// Mirrors backend com.flowdesk.security.Permissions so the UI only shows
// actions the current role is actually allowed to perform.
const MATRIX = {
  // Requests
  approveRequests:    ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER', 'FINANCE', 'HR'],
  createRequest:      ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER', 'EMPLOYEE', 'FINANCE', 'HR', 'IT', 'SUPPORT'],
  editRequest:        ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER'],
  deleteRequest:      ['SUPER_ADMIN', 'ORG_ADMIN'],
  // Members
  manageMembers:      ['SUPER_ADMIN', 'ORG_ADMIN'],
  editEmployee:       ['SUPER_ADMIN', 'ORG_ADMIN'],
  deactivateEmployee: ['SUPER_ADMIN', 'ORG_ADMIN'],
  // Departments
  manageDepartments:  ['SUPER_ADMIN', 'ORG_ADMIN'],
  // Admin
  viewAdmin:          ['SUPER_ADMIN', 'ORG_ADMIN'],
  manageOrgSettings:  ['SUPER_ADMIN', 'ORG_ADMIN'],
  // Audit / Reports
  viewAuditLogs:      ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
  createReport:       ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER', 'FINANCE', 'HR'],
  viewReports:        ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER', 'FINANCE', 'HR', 'AUDITOR'],
  // Files
  uploadFile:         ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER', 'EMPLOYEE', 'FINANCE', 'HR', 'IT', 'SUPPORT'],
  deleteFile:         ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD'],
  // Tasks
  createTask:         ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER'],
  editTask:           ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER'],
  // Workflows
  manageWorkflows:    ['SUPER_ADMIN', 'ORG_ADMIN'],
  // Analytics
  viewAnalytics:      ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER', 'FINANCE', 'HR', 'AUDITOR'],
};

export function can(role, action) {
  const allowed = MATRIX[action];
  if (!allowed) return false;
  return !!role && allowed.includes(role);
}

export function usePermissions() {
  const { user } = useApp();
  const role = user?.role;
  return {
    role,
    can: (action) => can(role, action),
  };
}

// ─── Role display metadata ────────────────────────────────────────────────────

export const ROLE_LABELS = {
  SUPER_ADMIN:     'Super Admin',
  ORG_ADMIN:       'Org Admin',
  DEPARTMENT_HEAD: 'Dept. Head',
  MANAGER:         'Manager',
  FINANCE:         'Finance',
  HR:              'HR',
  IT:              'IT',
  AUDITOR:         'Auditor',
  SUPPORT:         'Support',
  EMPLOYEE:        'Employee',
  VIEWER:          'Viewer',
};

export const ROLE_COLORS = {
  SUPER_ADMIN:     'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  ORG_ADMIN:       'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  DEPARTMENT_HEAD: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  MANAGER:         'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  FINANCE:         'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  HR:              'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  IT:              'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  AUDITOR:         'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  SUPPORT:         'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  EMPLOYEE:        'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  VIEWER:          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

export const ROLE_OPTIONS = [
  'EMPLOYEE', 'MANAGER', 'DEPARTMENT_HEAD', 'FINANCE', 'HR', 'IT', 'AUDITOR', 'VIEWER', 'SUPPORT', 'ORG_ADMIN',
];
