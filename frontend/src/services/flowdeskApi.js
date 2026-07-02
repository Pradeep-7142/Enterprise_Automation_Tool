import {
  apiGet, apiPost, apiPatch, apiDelete,
  setTokens, setStoredUser, clearSession,
} from './api';

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  const data = await apiPost('/auth/login', { email, password });
  setTokens(data.accessToken, data.refreshToken);
  if (data.user) setStoredUser(data.user);
  return data;
}

export async function signup({ name, email, password, company }) {
  const parts = (name || '').trim().split(/\s+/);
  const firstName = parts[0] || 'User';
  const lastName = parts.slice(1).join(' ') || 'Account';
  const data = await apiPost('/auth/signup', {
    firstName, lastName, email, password,
    organizationName: company || undefined,
  });
  setTokens(data.accessToken, data.refreshToken);
  if (data.user) setStoredUser(data.user);
  return data;
}

export async function logout() {
  try {
    const refresh = localStorage.getItem('fd_refresh_token');
    if (refresh) await apiPost('/auth/logout', { refreshToken: refresh });
  } catch {}
  clearSession();
}

export async function getMe() {
  const user = await apiGet('/auth/me');
  setStoredUser(user);
  return user;
}

export async function forgotPassword(email) {
  return apiPost('/auth/forgot-password', { email });
}

export async function resetPassword(token, password) {
  return apiPost('/auth/reset-password', { token, newPassword: password });
}

export async function verifyOtp(code) {
  return apiPost('/auth/verify-otp', { code });
}

export async function changePassword(currentPassword, newPassword) {
  return apiPost('/auth/change-password', { currentPassword, newPassword });
}

// ─── Requests ────────────────────────────────────────────────────────────────

export function getRequests(params) {
  return apiGet('/requests', params);
}

export function getRequest(id) {
  return apiGet(`/requests/${id}`);
}

export function createRequest(body) {
  return apiPost('/requests', body);
}

export function updateRequest(id, body) {
  return apiPatch(`/requests/${id}`, body);
}

export function deleteRequest(id) {
  return apiDelete(`/requests/${id}`);
}

export function approveRequest(id, comment) {
  return apiPost(`/requests/${id}/approve`, { action: 'approve', comment });
}

export function rejectRequest(id, comment) {
  return apiPost(`/requests/${id}/reject`, { action: 'reject', comment });
}

export function getRecentRequests(limit = 6) {
  return apiGet('/requests/recent', { limit });
}

export function getPendingApprovals() {
  return apiGet('/requests/pending-approvals');
}

export function addRequestComment(id, text) {
  return apiPost(`/requests/${id}/comments`, { text });
}

// ─── Employees & Departments ─────────────────────────────────────────────────

export function getEmployees(params) {
  return apiGet('/employees', params);
}

export function getEmployee(id) {
  return apiGet(`/employees/${id}`);
}

export function createEmployee(body) {
  return apiPost('/employees', body);
}

export function updateEmployee(id, body) {
  return apiPatch(`/employees/${id}`, body);
}

export function deactivateEmployee(id) {
  return apiPatch(`/employees/${id}/deactivate`);
}

export function activateEmployee(id) {
  return apiPatch(`/employees/${id}/activate`);
}

export function getDepartments() {
  return apiGet('/departments');
}

export function getDepartment(id) {
  return apiGet(`/departments/${id}`);
}

export function createDepartment(body) {
  return apiPost('/departments', body);
}

export function updateDepartment(id, body) {
  return apiPatch(`/departments/${id}`, body);
}

export function deleteDepartment(id) {
  return apiDelete(`/departments/${id}`);
}

// ─── Dashboard & Analytics ───────────────────────────────────────────────────

export function getDashboard() {
  return apiGet('/dashboard');
}

export function getAnalytics(params) {
  return apiGet('/analytics', params);
}

// ─── Notifications ───────────────────────────────────────────────────────────

export function getNotifications(filter) {
  return apiGet('/notifications', filter ? { filter } : undefined);
}

export function getUnreadCount() {
  return apiGet('/notifications/unread-count');
}

export function markNotificationRead(id) {
  return apiPatch(`/notifications/${id}/read`);
}

export function markAllNotificationsRead() {
  return apiPost('/notifications/read-all');
}

// ─── Messages ────────────────────────────────────────────────────────────────

export function getConversations() {
  return apiGet('/messages/conversations');
}

export function getMessages(conversationId) {
  return apiGet(`/messages/conversations/${conversationId}`);
}

export function sendMessage(conversationId, text) {
  return apiPost(`/messages/conversations/${conversationId}`, { text });
}

export function startDirectConversation(employeeId) {
  return apiPost(`/messages/conversations/direct/${employeeId}`);
}

// ─── Files ───────────────────────────────────────────────────────────────────

export function getFiles(params) {
  return apiGet('/files', params);
}

export function uploadFile(formData) {
  return apiPost('/files/upload', formData, { isFormData: true });
}

export function deleteFile(id) {
  return apiDelete(`/files/${id}`);
}

export function getFileDownloadUrl(id) {
  return apiGet(`/files/${id}/download-url`);
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export function getAuditLogs(params) {
  return apiGet('/audit-logs', params);
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export function getReports() {
  return apiGet('/reports');
}

export function generateReport(body) {
  return apiPost('/reports', body);
}

export function downloadReport(id) {
  return apiGet(`/reports/${id}/download`);
}

// ─── Tasks ───────────────────────────────────────────────────────────────────

export function getTasks(params) {
  return apiGet('/tasks', params);
}

export function createTask(body) {
  return apiPost('/tasks', body);
}

export function updateTask(id, body) {
  return apiPatch(`/tasks/${id}`, body);
}

export function completeTask(id) {
  return apiPatch(`/tasks/${id}/complete`);
}

// ─── Workflows ───────────────────────────────────────────────────────────────

export function getWorkflows() {
  return apiGet('/workflows');
}

export function getWorkflow(id) {
  return apiGet(`/workflows/${id}`);
}

export function createWorkflow(body) {
  return apiPost('/workflows', body);
}

export function updateWorkflow(id, body) {
  return apiPatch(`/workflows/${id}`, body);
}

export function activateWorkflow(id) {
  return apiPatch(`/workflows/${id}/activate`);
}

export function deactivateWorkflow(id) {
  return apiPatch(`/workflows/${id}/deactivate`);
}

// ─── Search & Admin ──────────────────────────────────────────────────────────

export function globalSearch(q) {
  return apiGet('/search', { q });
}

export function getAdminStats() {
  return apiGet('/admin/stats');
}

export function getAdminHealth() {
  return apiGet('/admin/health');
}

export function getAdminUsers(params) {
  return apiGet('/admin/users', params);
}

export function updateAdminUser(id, body) {
  return apiPatch(`/admin/users/${id}`, body);
}

export function getOrgSettings() {
  return apiGet('/admin/org-settings');
}

export function updateOrgSettings(body) {
  return apiPatch('/admin/org-settings', body);
}

export function updateProfile(body) {
  return apiPatch('/auth/profile', body);
}
