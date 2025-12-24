require('dotenv').config();
const { fetchData } = require('./fetchData');
const cache = require('../cache/fixtures.cache');
const logger = require('../utils/logger');
const { FIXTURES } = require('../constants/rooms');

const FIXTURES_API_URL = `https://cricket.sportmonks.com/api/v2.0/fixtures?api_token=${process.env.MATCH_API_TOKEN}&filter[season_id]=1730&filter[status]=NS&sort=starting_at`;

/**
 * Fetches upcoming fixtures and updates the cache.
 * Sorts by starting_at ascending (closest first).
 */
const updateFixtures = async () => {
    logger.debug('Fetching fixtures...');
    
    // Check if URL has sort param, if not we sort manually
    const data = await fetchData(FIXTURES_API_URL);

    if (!data || !data.data || !Array.isArray(data.data)) {
        logger.error('Invalid Fixtures API response structure', data);
        return false;
    }

    let fixtures = data.data;

    // Ensure sorting by starting_at (closest first)
    // "starting_at" format is typically ISO or similar string that is lexically sortable
    fixtures.sort((a, b) => {
        const dateA = new Date(a.starting_at);
        const dateB = new Date(b.starting_at);
        return dateA - dateB;
    });

    cache.set(fixtures);
    logger.info(`Updated cache with ${fixtures.length} fixtures`);
    return true;
};

/**
 * Broadcasts fixtures to the fixtures room.
 * @param {object} io 
 */
const broadcastFixtures = (io) => {
    const fixtures = cache.get();
    io.to(FIXTURES).emit('fixtures_data', fixtures);
    logger.debug(`Broadcasted ${fixtures.length} fixtures to '${FIXTURES}' room`);
};

module.exports = { updateFixtures, broadcastFixtures };
