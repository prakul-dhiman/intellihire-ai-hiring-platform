/**
 * Normalize API / localStorage user objects to a stable client shape (`id` always string).
 */
export function normalizeClientUser(u) {
    if (!u || typeof u !== 'object') return null;
    const id = u.id ?? u._id;
    if (id == null) return null;
    return {
        id: String(id),
        name: u.name,
        email: u.email,
        role: u.role,
    };
}
