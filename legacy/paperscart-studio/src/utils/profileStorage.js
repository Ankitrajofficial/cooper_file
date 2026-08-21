import { createEmptyCompanyProfile, normalizeCompanyProfile } from './companyProfile';

const STORAGE_KEY_PREFIX = 'business-doc-company-profile-v1';

const defaultStoredProfile = {
  company: createEmptyCompanyProfile(),
  isLocked: false,
  updatedAt: null,
};

function getStorageKey(namespace = 'guest') {
  return `${STORAGE_KEY_PREFIX}:${namespace}`;
}

export function readStoredCompanyProfile(namespace) {
  try {
    const raw = localStorage.getItem(getStorageKey(namespace));
    if (!raw) return defaultStoredProfile;

    const parsed = JSON.parse(raw);
    return {
      company: normalizeCompanyProfile(parsed?.company),
      isLocked: Boolean(parsed?.isLocked),
      updatedAt: typeof parsed?.updatedAt === 'string' ? parsed.updatedAt : null,
    };
  } catch {
    return defaultStoredProfile;
  }
}

export function writeStoredCompanyProfile(profileState, namespace) {
  try {
    const safeState = {
      company: normalizeCompanyProfile(profileState?.company),
      isLocked: Boolean(profileState?.isLocked),
      updatedAt: typeof profileState?.updatedAt === 'string' ? profileState.updatedAt : null,
    };
    localStorage.setItem(getStorageKey(namespace), JSON.stringify(safeState));
  } catch (error) {
    console.warn('Company profile save failed:', error);
  }
}
