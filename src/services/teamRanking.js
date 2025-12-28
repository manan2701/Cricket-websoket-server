const { fetchData } = require('./fetchData');
const cache = require('../cache/ranking.cache');
const logger = require('../utils/logger');
const { RANKINGS } = require('../constants/rooms');
const { teamRankingSummary } = require('../utils/teamRankingSummary');

const API_URL = `https://cricket.sportmonks.com/api/v2.0/team-rankings?api_token=${process.env.MATCH_API_TOKEN}`;

const updateTeamRanking = async () => {
    logger.debug('Fetching team rankings...');
    const data = await fetchData(API_URL);
    
    // Validate response structure (SportMonks usually returns { data: [...] })
    if (!data || !data.data || !Array.isArray(data.data)) {
        logger.error('Invalid API response structure', data);
        return false;
    }
    
    const rankings = data.data;
    cache.set(rankings);

    logger.info(`Updated Teams Ranking`);
    return true;
};

/**
 * Broadcasts the current cache state to relevant Socket.IO rooms.
 * @param {object} io - Socket.io instance
 */
const broadcastUpdates = (io) => {
    const rankings = cache.get();
    
    const summary = teamRankingSummary(rankings); 

    io.to(RANKINGS).emit('team_ranking_summary', summary);

    logger.debug(`Broadcasted updates to rankings.`);
};

module.exports = { updateTeamRanking, broadcastUpdates };