import { normalizeClientUser } from './normalizeClientUser';

/** Same-tab localStorage updates do not fire `storage`; we broadcast explicitly. */
export const AUTH_STORAGE_EVENT = 'intellihire-auth-storage';

export function notifyAuthStorageChanged() {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
}

export function getStoredAuthUser() {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('user');
        return raw ? normalizeClientUser(JSON.parse(raw)) : null;
    } catch {
        return null;
    }
}

/** For useSyncExternalStore: re-render when auth in localStorage changes (any tab or same tab). */
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
