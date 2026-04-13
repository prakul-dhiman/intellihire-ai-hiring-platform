import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { subscribeStoredAuth, getStoredAuthUser } from '../utils/authStorageSync';

/**
 * Merges React auth with `localStorage` and forces re-renders when the session
 * changes in the **same tab** (via `notifyAuthStorageChanged`).
 *
 * Note: `useSyncExternalStore` was avoided here because `getStoredAuthUser()`
 * must return a referentially stable value when the underlying JSON is unchanged;
 * returning a fresh object every read breaks React 18/19 external-store semantics
 * and can leave production (minified) builds stuck on stale UI.
 */
export function useEffectiveAuthUser() {
    const { user, isAuthenticated } = useAuth();
    const [, setStorageTick] = useState(0);

    useEffect(() => {
        return subscribeStoredAuth(() => setStorageTick((n) => n + 1));
    }, []);

    // Context session identity changed — re-read storage (covers login without a missed event).
    useEffect(() => {
        setStorageTick((n) => n + 1);
    }, [user?.id, user?.email]);

    const storedUser = getStoredAuthUser();
    const effectiveUser = user ?? storedUser;
    const isAuth = isAuthenticated || !!effectiveUser;
    return { user, storedUser, effectiveUser, isAuth };
}
