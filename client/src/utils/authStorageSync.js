import { normalizeClientUser } from './normalizeClientUser';

/** Same-tab localStorage updates do not fire `storage`; we broadcast explicitly. */
export const AUTH_STORAGE_EVENT = 'intellihire-auth-storage';

export function notifyAuthStorageChanged() {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
}

let lastUserRaw = undefined;
let lastUserParsed = null;

/**
 * Parsed session user, with referential stability when `localStorage` is unchanged
 * (important for any external-store style subscriptions).
 */
export function getStoredAuthUser() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('user');
        if (raw === lastUserRaw) return lastUserParsed;
        lastUserRaw = raw;
        lastUserParsed = raw ? normalizeClientUser(JSON.parse(raw)) : null;
        return lastUserParsed;
    } catch {
        lastUserRaw = null;
        lastUserParsed = null;
        return null;
    }
}

/** Re-render when auth in localStorage changes (any tab or same-tab `notifyAuthStorageChanged`). */
export function subscribeStoredAuth(listener) {
    if (typeof window === 'undefined') {
        return () => {};
    }
    window.addEventListener('storage', listener);
    window.addEventListener(AUTH_STORAGE_EVENT, listener);
    return () => {
        window.removeEventListener('storage', listener);
        window.removeEventListener(AUTH_STORAGE_EVENT, listener);
    };
}
