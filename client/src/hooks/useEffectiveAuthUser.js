import { useSyncExternalStore } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeStoredAuth, getStoredAuthUser } from '../utils/authStorageSync';

/**
 * Merges React auth state with a live read of `localStorage` so UI (e.g. Navbar)
 * updates in the same tab as login — `storage` events do not fire for the current tab.
 */
export function useEffectiveAuthUser() {
    const { user, isAuthenticated } = useAuth();
    const storedUser = useSyncExternalStore(
        subscribeStoredAuth,
        getStoredAuthUser,
        () => null
    );
    const effectiveUser = user ?? storedUser;
    const isAuth = isAuthenticated || !!effectiveUser;
    return { user, storedUser, effectiveUser, isAuth };
}
