import { getApiBase } from './apiConfig';

export function isPaperworkEmailApiConfigured() {
  return Boolean(getApiBase());
}

export function isWelcomeEmailApiConfigured() {
  return Boolean(getApiBase());
}

export async function sendWelcomeEmail(payload = {}, options = {}) {
  const apiBase = getApiBase();
  if (!apiBase) {
    throw new Error('Email API is not configured. Add VITE_API_URL to the frontend environment.');
  }

  const headers = { 'Content-Type': 'application/json' };
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const response = await fetch(`${apiBase}/api/email/welcome`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let data = null;
  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || responseText || 'Welcome email send failed.');
  }

  return data || { ok: true };
}

export async function sendPaperworkEmail(payload, options = {}) {
  const apiBase = getApiBase();
  if (!apiBase) {
    throw new Error('Email API is not configured. Add VITE_API_URL to the frontend environment.');
  }

  const headers = { 'Content-Type': 'application/json' };
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  const response = await fetch(`${apiBase}/api/email/paperwork`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let data = null;
  try {
    data = responseText ? JSON.parse(responseText) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || responseText || 'Email send failed.');
  }

  return data || { ok: true };
}
