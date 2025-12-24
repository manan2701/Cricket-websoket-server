/**
 * In-memory storage for fixtures data.
 * Can store a sorted list of upcoming matches.
 */
let fixturesCache = [];

const cache = {
    set: (data) => {
        fixturesCache = data;
    },
    get: () => fixturesCache,
    clear: () => {
        fixturesCache = [];
    }
};

module.exports = cache;
