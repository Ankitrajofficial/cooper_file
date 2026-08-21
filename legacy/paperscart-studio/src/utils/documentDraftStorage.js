const STORAGE_KEY_PREFIX = 'business-doc-document-drafts-v1';
const DRAFT_KEYS = ['invoice', 'agreement', 'timeline', 'leadSheet', 'qrCard'];

function getStorageKey(namespace = 'guest') {
  return `${STORAGE_KEY_PREFIX}:${namespace}`;
}

function cloneDraft(value) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

export function readStoredDocumentDrafts(namespace) {
  try {
    const raw = localStorage.getItem(getStorageKey(namespace));
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    return DRAFT_KEYS.reduce((drafts, key) => {
      if (parsed[key] && typeof parsed[key] === 'object') {
        drafts[key] = parsed[key];
      }
      return drafts;
    }, {});
  } catch {
    return {};
  }
}

export function writeStoredDocumentDrafts(drafts, namespace) {
  try {
    const safeDrafts = DRAFT_KEYS.reduce((nextDrafts, key) => {
      const clonedDraft = cloneDraft(drafts?.[key]);
      if (clonedDraft && typeof clonedDraft === 'object') {
        nextDrafts[key] = clonedDraft;
      }
      return nextDrafts;
    }, {});

    localStorage.setItem(getStorageKey(namespace), JSON.stringify(safeDrafts));
  } catch (error) {
    console.warn('Document draft save failed:', error);
  }
}

export function clearStoredDocumentDrafts(namespace) {
  try {
    localStorage.removeItem(getStorageKey(namespace));
  } catch {
    // noop
  }
}
