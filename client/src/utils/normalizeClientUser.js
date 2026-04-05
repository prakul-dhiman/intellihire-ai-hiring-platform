function extractId(u) {
    if (u.id != null) return u.id;
    const oid = u._id;
    if (oid == null) return null;
    if (typeof oid === 'object' && oid.$oid) return oid.$oid;
    return oid;
}

/**
 * Normalize API / localStorage user objects to a stable client shape (`id` always string).
 */
export function normalizeClientUser(u) {
    if (!u || typeof u !== 'object') return null;
    const id = extractId(u);
    if (id == null) return null;
    return {
        id: String(id),
        name: u.name,
        email: u.email,
        role: u.role,
    };
}
