// Auth client for the PapersCart backend (/api/auth/*), which stores users and
// sessions in Neon Postgres. Replaces the old Supabase auth client.

const TOKEN_KEY = 'pc:session-token';

const configuredApiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

// In production the Express server serves the frontend, so relative /api URLs
// work without configuration. VITE_API_URL points dev (Vite on :5173) at :3001.
export function getApiBase() {
  return configuredApiBase;
}

// Backend account types vs. frontend workspace modes differ by one label.
const ACCOUNT_TYPE_BY_WORKSPACE_MODE = {
  freelance: 'freelancer',
  business: 'business',
  agency: 'agency',
};
const WORKSPACE_MODE_BY_ACCOUNT_TYPE = {
  freelancer: 'freelance',
  business: 'business',
  agency: 'agency',
};

export function workspaceModeToAccountType(workspaceMode) {
  return ACCOUNT_TYPE_BY_WORKSPACE_MODE[workspaceMode] || 'freelancer';
}

const listeners = new Set();

export function getStoredToken() {
  if (typeof localStorage === 'undefined') return '';
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

function storeToken(token) {
  if (typeof localStorage === 'undefined') return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function subscribeToAuthChanges(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyAuthChange(session) {
  listeners.forEach((listener) => {
    try {
      listener(session);
    } catch {
      /* ignore */
    }
  });
}

// The rest of the app consumes the Supabase user shape (user_metadata etc.),
// so adapt our API user to it instead of touching every consumer.
function toAppUser(apiUser) {
  if (!apiUser) return null;
  return {
    id: apiUser.id,
    email: apiUser.email || '',
    user_metadata: {
      name: apiUser.name || '',
      workspaceMode: WORKSPACE_MODE_BY_ACCOUNT_TYPE[apiUser.accountType] || 'freelance',
    },
    accountType: apiUser.accountType,
    avatarUrl: apiUser.avatarUrl || '',
    phone: apiUser.phone || '',
  };
}

function toSession(token, apiUser) {
  if (!token || !apiUser) return null;
  return { access_token: token, user: toAppUser(apiUser) };
}

async function request(path, { method = 'GET', body, token } = {}) {
  let response;
  try {
    response = await fetch(`${configuredApiBase}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error('Failed to fetch');
  }

  if (response.status === 204) return null;

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(payload?.error || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

export async function fetchCurrentSession() {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const payload = await request('/api/auth/me', { token });
    return toSession(token, payload?.user);
  } catch (error) {
    // Only a definitive rejection clears the token; a network blip should not
    // sign the user out of their workspace.
    if (error.status === 401) {
      storeToken('');
      return null;
    }
    throw error;
  }
}

function adoptSession(payload) {
  const session = toSession(payload?.token, payload?.user);
  if (!session) throw new Error('The server did not return a session.');
  storeToken(payload.token);
  notifyAuthChange(session);
  return session;
}

export async function loginWithPassword({ email, password }) {
  const payload = await request('/api/auth/login', { method: 'POST', body: { email, password } });
  return adoptSession(payload);
}

export async function registerAccount({ name, email, password, workspaceMode }) {
  const payload = await request('/api/auth/register', {
    method: 'POST',
    body: { name, email, password, accountType: workspaceModeToAccountType(workspaceMode) },
  });
  return adoptSession(payload);
}

export async function loginWithGoogleCredential({ credential, mode, workspaceMode }) {
  const payload = await request('/api/auth/google', {
    method: 'POST',
    body: {
      credential,
      mode: mode === 'signup' ? 'signup' : 'login',
      accountType: workspaceModeToAccountType(workspaceMode),
    },
  });
  return adoptSession(payload);
}

export async function updateAccount({ name, email, phone, avatarUrl }) {
  const token = getStoredToken();
  if (!token) throw new Error('You are signed out. Sign in again to update your account.');

  const body = {};
  if (name !== undefined) body.name = name;
  if (email !== undefined) body.email = email;
  if (phone !== undefined) body.phone = phone;
  if (avatarUrl !== undefined) body.avatarUrl = avatarUrl;

  const payload = await request('/api/account', { method: 'PATCH', body, token });
  const session = toSession(token, payload?.user);
  if (!session) throw new Error('The server did not return the updated account.');
  // Reuse the existing session channel so the header and anything else reading
  // the user re-render with the new details immediately.
  notifyAuthChange(session);
  return session;
}

export async function logout() {
  const token = getStoredToken();
  storeToken('');
  notifyAuthChange(null);
  if (!token) return;
  try {
    await request('/api/auth/logout', { method: 'POST', token });
  } catch {
    // The local session is already cleared; a failed server call only leaves
    // an expired-token row behind, which the server cleans up on its own.
  }
}
