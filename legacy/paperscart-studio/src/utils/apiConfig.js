function getEnvValue(key) {
  try {
    const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
    const value = env[key];
    return value && String(value).trim() ? String(value).trim().replace(/\/$/, '') : '';
  } catch {
    return '';
  }
}

export function getApiBase() {
  const configuredBase = getEnvValue('VITE_API_URL');
  if (configuredBase) return configuredBase;
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return '';
}

export function getHistoryApiBase() {
  return getEnvValue('VITE_HISTORY_API_URL');
}

export function getGoogleClientId() {
  try {
    const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
    const value = env.VITE_GOOGLE_CLIENT_ID;
    return value && String(value).trim() ? String(value).trim() : '';
  } catch {
    return '';
  }
}
