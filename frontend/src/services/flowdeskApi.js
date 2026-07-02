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

export function getDepartments() {
  return apiGet('/departments');
}

// ─── Dashboard & Analytics ───────────────────────────────────────────────────

export function getDashboard() {
  return apiGet('/dashboard');
}

export function getAnalytics() {
  return apiGet('/analytics');
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

// ─── Files, Audit, Reports, Tasks, Workflows, Search, Admin ─────────────────

export function getFiles() {
  return apiGet('/files');
}

export function getAuditLogs(params) {
  return apiGet('/audit-logs', params);
}

export function getReports() {
  return apiGet('/reports');
}

export function getTasks() {
  return apiGet('/tasks');
}

export function getWorkflows() {
  return apiGet('/workflows');
}

export function getWorkflow(id) {
  return apiGet(`/workflows/${id}`);
}

export function globalSearch(q) {
  return apiGet('/search', { q });
}

export function getAdminStats() {
  return apiGet('/admin/stats');
}

export function getAdminHealth() {
  return apiGet('/admin/health');
}
