
const { fetchData } = require('./fetchData');
const fixturesCache = require('../cache/fixtures.cache');
const resultCache = require('../cache/result.cache');
const logger = require('../utils/logger');
const { FIXTURES, RESULTS } = require('../constants/rooms');
const { summariseUpcomingFixtures } = require('../utils/upcomingMatchSummary');
const { summariseUpcomingResults } = require('../utils/matchResultSummary');

function getDateRange({ pastDays = 0, futureDays = 0 } = {}) {
    const today = new Date();

    const fromDate = new Date(today);
    fromDate.setDate(today.getDate() - pastDays);

    const toDate = new Date(today);
    toDate.setDate(today.getDate() + futureDays);

    const from = fromDate.toISOString().split("T")[0];
    const to = toDate.toISOString().split("T")[0];

    return { from, to };
}

const { from: upcomingFrom, to: upcomingTo } =
    getDateRange({ futureDays: 30 });

const { from: resultFrom, to: resultTo } =
    getDateRange({ pastDays: 30 });

const UPCOMING_MATCH_API = `https://cricket.sportmonks.com/api/v2.0/fixtures?api_token=${process.env.MATCH_API_TOKEN}&filter[status]=NS&filter[starts_between]=${upcomingFrom},${upcomingTo}&sort=starting_at&include=localteam,visitorteam,venue,league`;

// const UPCOMING_MATCH_API = `https://cricket.sportmonks.com/api/v2.0/fixtures?api_token=${process.env.MATCH_API_TOKEN}&filter[status]=NS&sort=starting_at&filter[starts_between]=${from},${to}&include=localteam,visitorteam,venue,league`;
const RESULT_MATCH_API = `https://cricket.sportmonks.com/api/v2.0/fixtures?api_token=${process.env.MATCH_API_TOKEN}&filter[starts_between]=${resultFrom},${resultTo}&sort=-starting_at&include=localteam,visitorteam,venue,league,winnerteam,runs`;

/**
 * Fetches upcoming fixtures and updates the cache.
 * Sorts by starting_at ascending (closest first).
 */
const updateFixtures = async () => {
    logger.debug('Fetching fixtures...');

    // Check if URL has sort param, if not we sort manually
    const data = await fetchData(UPCOMING_MATCH_API);

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

    fixturesCache.set(fixtures);
    logger.info(`Updated cache with ${fixtures.length} fixtures`);
    return true;
};

const updateResults = async () => {
    logger.debug('Fetching result...');

    // Check if URL has sort param, if not we sort manually
    const data = await fetchData(RESULT_MATCH_API);
    if (!data || !data.data || !Array.isArray(data.data)) {
        logger.error('Invalid result API response structure', data);
        return false;
    }

    let result = data.data;

    // Ensure sorting by starting_at (closest first)
    // "starting_at" format is typically ISO or similar string that is lexically sortable
    // result.sort((a, b) => {
    //     const dateA = new Date(a.starting_at);
    //     const dateB = new Date(b.starting_at);
    //     return dateA - dateB;
    // });

    resultCache.set(result);
    logger.info(`Updated cache with ${result.length} result`);
    return true;
};


/**
 * Broadcasts fixtures to the fixtures room.
 * @param {object} io 
 */
const broadcastFixtures = (io) => {
    const fixtures = fixturesCache.get();
    const summary = summariseUpcomingFixtures(fixtures);
    // console.log(summary)
    io.to(FIXTURES).emit('upcoming_matches_summary', summary);
    logger.debug(`Broadcasted fixtures summary to '${FIXTURES}' room`);
};
const broadcastResults = (io) => {
    const result = resultCache.get();
    const summary = summariseUpcomingResults(result);
    // console.log(summary)
    io.to(RESULTS).emit('result_matches_summary', summary);
    logger.debug(`Broadcasted result summary to '${RESULTS}' room`);
};

module.exports = { 
    updateFixtures,
    broadcastFixtures,
    updateResults,
    broadcastResults 
};
