/**
 * Document history storage.
 * - If VITE_HISTORY_API_URL is set (e.g. http://localhost:3001), uses the API.
 * - Otherwise uses localStorage.
 */

import { getHistoryApiBase } from './apiConfig';

const STORAGE_KEY = 'business-doc-history';

function genId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ——— localStorage ———
function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { invoice: [], agreement: [], scope: [], timeline: [], leadsheet: [], qrcard: [], shippinglabel: [], templates: [] };
    const parsed = JSON.parse(raw);
    return {
      invoice: Array.isArray(parsed.invoice) ? parsed.invoice : [],
      agreement: Array.isArray(parsed.agreement) ? parsed.agreement : [],
      scope: Array.isArray(parsed.scope) ? parsed.scope : [],
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
      leadsheet: Array.isArray(parsed.leadsheet) ? parsed.leadsheet : [],
      qrcard: Array.isArray(parsed.qrcard) ? parsed.qrcard : [],
      shippinglabel: Array.isArray(parsed.shippinglabel) ? parsed.shippinglabel : [],
      templates: Array.isArray(parsed.templates) ? parsed.templates : [],
    };
  } catch {
    return { invoice: [], agreement: [], scope: [], timeline: [], leadsheet: [], qrcard: [], shippinglabel: [], templates: [] };
  }
}

function writeLocal(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('History save failed:', e);
  }
}

// ——— API (MongoDB) ———
async function apiFetch(path, options = {}) {
  const base = getHistoryApiBase();
  if (!base) throw new Error('No API URL');
  const url = `${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    let body;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    const err = new Error(body?.error || res.statusText || 'API error');
    err.status = res.status;
    err.body = body;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// ——— Public API ———

export function isUsingMongo() {
  return !!getHistoryApiBase();
}

export function getHistory(docType) {
  const base = getHistoryApiBase();
  if (base) {
    return apiFetch(`/api/history/${docType}`).then((list) => {
      return Array.isArray(list) ? list : [];
    });
  }
  const state = readLocal();
  const list = state[docType] || [];
  return Promise.resolve(
    list.slice().sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt))
  );
}

export function saveToHistory(docType, payload) {
  const base = getHistoryApiBase();
  if (base) {
    return apiFetch(`/api/history/${docType}`, {
      method: 'POST',
      body: JSON.stringify({
        label: payload.label || `${docType} ${new Date().toLocaleDateString()}`,
        company: payload.company,
        data: payload.data,
        meta: payload.meta || null,
      }),
    });
  }
  const state = readLocal();
  const list = state[docType] || [];
  const entry = {
    id: genId(),
    savedAt: new Date().toISOString(),
    label: payload.label || `${docType} ${new Date().toLocaleDateString()}`,
    company: payload.company,
    data: payload.data,
    meta: payload.meta || null,
  };
  state[docType] = [entry, ...list];
  writeLocal(state);
  return Promise.resolve(entry);
}

export function deleteFromHistory(docType, id) {
  const base = getHistoryApiBase();
  if (base) {
    return apiFetch(`/api/history/${docType}/${id}`, { method: 'DELETE' });
  }
  const state = readLocal();
  const list = (state[docType] || []).filter((e) => e.id !== id);
  state[docType] = list;
  writeLocal(state);
  return Promise.resolve();
}

export function getHistoryEntry(docType, id) {
  const base = getHistoryApiBase();
  if (base) {
    return apiFetch(`/api/history/${docType}/${id}`);
  }
  const list = getHistory(docType);
  return Promise.resolve(list).then((arr) => arr.find((e) => e.id === id) || null);
}

export function updateHistoryEntry(docType, id, updates) {
  const base = getHistoryApiBase();
  if (base) {
    return apiFetch(`/api/history/${docType}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }
  const state = readLocal();
  const list = state[docType] || [];
  state[docType] = list.map((entry) =>
    entry.id === id ? { ...entry, ...updates } : entry
  );
  writeLocal(state);
  return Promise.resolve(state[docType].find((e) => e.id === id));
}
