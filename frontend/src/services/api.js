const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

function getAccessToken() {
  try { return localStorage.getItem('fd_access_token'); } catch { return null; }
}

function getRefreshToken() {
  try { return localStorage.getItem('fd_refresh_token'); } catch { return null; }
}

export function setTokens(access, refresh) {
  try {
    if (access) localStorage.setItem('fd_access_token', access);
    if (refresh) localStorage.setItem('fd_refresh_token', refresh);
    localStorage.setItem('fd_auth', 'true');
  } catch {}
}

export function setStoredUser(user) {
  try { localStorage.setItem('fd_user', JSON.stringify(user)); } catch {}
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('fd_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function clearSession() {
  try {
    localStorage.removeItem('fd_access_token');
    localStorage.removeItem('fd_refresh_token');
    localStorage.removeItem('fd_user');
    localStorage.setItem('fd_auth', 'false');
  } catch {}
}

export function hasSession() {
  return !!getAccessToken();
}

async function parseResponse(res) {
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = {}; }
  if (!res.ok || body.success === false) {
    const msg = body.error?.message || body.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return body.data;
}

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('Session expired');
  const data = await parseResponse(await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  }));
  setTokens(data.accessToken, data.refreshToken);
  if (data.user) setStoredUser(data.user);
  return data.accessToken;
}

export async function apiRequest(path, options = {}) {
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && !options._retry && getRefreshToken()) {
    try {
      await refreshAccessToken();
      return apiRequest(path, { ...options, _retry: true });
    } catch {
      clearSession();
      throw new Error('Session expired');
    }
  }

  return parseResponse(res);
}

export async function apiGet(path, params) {
  const qs = params ? '?' + new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '' && v !== 'all')
  ).toString() : '';
  return apiRequest(path + qs);
}

export async function apiPost(path, body) {
  return apiRequest(path, {
    method: 'POST',
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

export async function apiPut(path, body) {
  return apiRequest(path, { method: 'PUT', body: JSON.stringify(body) });
}

export async function apiPatch(path, body) {
  return apiRequest(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function apiDelete(path) {
  return apiRequest(path, { method: 'DELETE' });
}
