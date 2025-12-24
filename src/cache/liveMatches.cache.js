/**
 * In-memory storage for live match data.
 * Map<matchId, matchData>
 */
const liveMatchCache = new Map();

const cache = {
    set: (id, data) => liveMatchCache.set(String(id), data),
    get: (id) => liveMatchCache.get(String(id)),
    getAll: () => Array.from(liveMatchCache.values()),
    has: (id) => liveMatchCache.has(String(id)),
    clear: () => liveMatchCache.clear(),
    delete: (id) => liveMatchCache.delete(String(id)),
    size: () => liveMatchCache.size
};

module.exports = cache;
