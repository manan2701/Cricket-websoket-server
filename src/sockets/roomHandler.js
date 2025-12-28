const cache = require('../cache/liveMatches.cache');
const fixturesCache = require('../cache/fixtures.cache');
const resultCache = require('../cache/result.cache');
const { MATCH_PREFIX, GLOBAL_LIVE, FIXTURES, RESULTS, RANKINGS } = require('../constants/rooms');
const logger = require('../utils/logger');
const { summariseUpcomingFixtures } = require('../utils/upcomingMatchSummary');
const { buildLiveMatchesListSummary } = require('../utils/liveMatchSummary');
const { summariseUpcomingResults } = require('../utils/matchResultSummary');
const { teamRankingSummary } = require('../utils/teamRankingSummary');


module.exports = (io, socket) => {
    
    // Handle Join Room
    socket.on('join_room', (roomName) => {
        socket.join(roomName);
        logger.debug(`Socket ${socket.id} joined room: ${roomName}`);

        // INSTANT DATA EMISSION LOGIC
        
        // Case 1: Joined Global Live Room
        if (roomName === GLOBAL_LIVE) {
            const allMatches = cache.getAll();
            const summary = buildLiveMatchesListSummary(allMatches);
            if (allMatches.length > 0) {
                socket.emit('live_matches_summary', summary);
                logger.debug(`Sent cached summary to ${socket.id}`);
            }
        }

        // Case 2: Joined Fixtures Room
        if (roomName === FIXTURES) {
            const fixtures = fixturesCache.get();
            const summary = summariseUpcomingFixtures(fixtures);
            if (fixtures && fixtures.length > 0) {
                socket.emit('upcoming_matches_summary', summary);
                logger.debug(`Sent cached fixtures summary to ${socket.id}`);
            }
        }

        if (roomName === RESULTS) {
            const result = resultCache.get();
            const summary = summariseUpcomingResults(result);
            if (result && result.length > 0) {
                socket.emit('upcoming_matches_summary', summary);
                logger.debug(`Sent cached results summary to ${socket.id}`);
            }
        }
        

        // Case 2: Joined Specific Match Room
        if (roomName.startsWith(MATCH_PREFIX)) {
            const matchId = roomName.replace(MATCH_PREFIX, ''); // Extract ID
            const matchData = cache.get(matchId);
            
            if (matchData) {
                socket.emit('match_data', matchData);
                logger.debug(`Sent cached match data for ${matchId} to ${socket.id}`);
            } else {
                // Optional: Send a "loading" or "not found" state
                // socket.emit('match_not_found', { id: matchId });
            }
        }

        if (roomName === RANKINGS) {
            const rankings = resultCache.get();
            const summary = teamRankingSummary(rankings);
            if (rankings && rankings.length > 0) {
                socket.emit('team_ranking_summary', summary);
                logger.debug(`Sent cached rankings summary to ${socket.id}`);
            }
        }
    });

    // Handle Leave Room (Optional, usually automatic on disconnect)
    socket.on('leave_room', (roomName) => {
        socket.leave(roomName);
        logger.debug(`Socket ${socket.id} left room: ${roomName}`);
    });
};
