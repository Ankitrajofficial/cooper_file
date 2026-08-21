// Historical filename: this module used to sync the business profile to a
// Supabase table. It now talks to our backend (/api/profile), which stores the
// profile in Neon Postgres. Function names kept so call sites didn't change.
import { normalizeCompanyProfile } from './companyProfile';
import { readStoredCompanyProfile } from './profileStorage';
import { getApiBase, getStoredToken } from './authClient';

function normalizeProfileState(profileState) {
  return {
    company: normalizeCompanyProfile(profileState?.company),
    isLocked: Boolean(profileState?.isLocked),
    updatedAt: typeof profileState?.updatedAt === 'string' ? profileState.updatedAt : null,
  };
}

function hasProfileData(profileState) {
  const normalized = normalizeProfileState(profileState);
  return Boolean(
    normalized.updatedAt ||
      Object.values(normalized.company).some((value) => typeof value === 'string' && value.trim())
  );
}

export function getLocalCompanyProfileFallback(userId) {
  const userProfile = readStoredCompanyProfile(userId);
  if (hasProfileData(userProfile)) return userProfile;

  const legacyLocalProfile = readStoredCompanyProfile('local');
  if (hasProfileData(legacyLocalProfile)) return legacyLocalProfile;

  return userProfile;
}

async function profileRequest(method, body) {
  const token = getStoredToken();
  if (!token) throw new Error('You are signed out. Sign in to sync your profile.');

  const response = await fetch(`${getApiBase()}/api/profile`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || `Profile sync failed (${response.status}).`);
  }
  return payload;
}

export async function loadSupabaseCompanyProfile(userId) {
  const payload = await profileRequest('GET');

  if (!payload?.profile) {
    return getLocalCompanyProfileFallback(userId);
  }

  return normalizeProfileState(payload.profile);
}

export async function saveSupabaseCompanyProfile(userId, profileState) {
  const normalized = normalizeProfileState(profileState);

  const payload = await profileRequest('PUT', {
    company: normalized.company,
    isLocked: normalized.isLocked,
    updatedAt: normalized.updatedAt || new Date().toISOString(),
  });

  return normalizeProfileState(payload?.profile);
}
