const key = (actionSlug) => `documentPreviewDraft:${actionSlug}`;

/**
 * Persist form payload for the full-page preview route (sessionStorage).
 * May throw if quota exceeded (e.g. very large embedded images).
 */
export function savePreviewDraft(actionSlug, payload) {
  sessionStorage.setItem(key(actionSlug), JSON.stringify(payload));
}

export function loadPreviewDraft(actionSlug) {
  const raw = sessionStorage.getItem(key(actionSlug));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearPreviewDraft(actionSlug) {
  sessionStorage.removeItem(key(actionSlug));
}
