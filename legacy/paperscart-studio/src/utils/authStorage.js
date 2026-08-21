const STORAGE_KEY = 'business-doc-auth-session-v1';

function normalizeUser(user) {
  if (!user || typeof user !== 'object') return null;
  return {
    id: typeof user.id === 'string' ? user.id : '',
    name: typeof user.name === 'string' ? user.name : '',
    email: typeof user.email === 'string' ? user.email : '',
    accountType: typeof user.accountType === 'string' ? user.accountType : '',
    avatarUrl: typeof user.avatarUrl === 'string' ? user.avatarUrl : '',
    createdAt: typeof user.createdAt === 'string' ? user.createdAt : null,
    lastLoginAt: typeof user.lastLoginAt === 'string' ? user.lastLoginAt : null,
  };
}

export function readAuthSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const token = typeof parsed?.token === 'string' ? parsed.token : '';
    const user = normalizeUser(parsed?.user);
    if (!token || !user?.id) return null;
    return { token, user };
  } catch {
    return null;
  }
}

export function writeAuthSession(session) {
  try {
    if (!session?.token || !session?.user?.id) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: String(session.token),
        user: normalizeUser(session.user),
      })
    );
  } catch (error) {
    console.warn('Auth session save failed:', error);
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

export function getAuthToken() {
  return readAuthSession()?.token || '';
}
