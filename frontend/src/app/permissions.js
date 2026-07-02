import { useApp } from './context/AppContext';

// Mirrors backend com.flowdesk.security.Permissions so the UI only shows
// actions the current role is actually allowed to perform.
const MATRIX = {
  approveRequests: ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER', 'FINANCE', 'HR'],
  createRequest: ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER', 'EMPLOYEE', 'FINANCE', 'HR', 'IT', 'SUPPORT'],
  editRequest: ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER'],
  deleteRequest: ['SUPER_ADMIN', 'ORG_ADMIN'],
  manageMembers: ['SUPER_ADMIN', 'ORG_ADMIN'],
  viewAdmin: ['SUPER_ADMIN', 'ORG_ADMIN'],
  viewAuditLogs: ['SUPER_ADMIN', 'ORG_ADMIN', 'AUDITOR'],
  createReport: ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER', 'FINANCE', 'HR'],
  uploadFile: ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD', 'MANAGER', 'EMPLOYEE', 'FINANCE', 'HR', 'IT', 'SUPPORT'],
  deleteFile: ['SUPER_ADMIN', 'ORG_ADMIN', 'DEPARTMENT_HEAD'],
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
