const cache = require('../cache/liveMatches.cache');
const fixturesCache = require('../cache/fixtures.cache');
const { MATCH_PREFIX, GLOBAL_LIVE, FIXTURES } = require('../constants/rooms');
const logger = require('../utils/logger');

module.exports = (io, socket) => {
    
    // Handle Join Room
    socket.on('join_room', (roomName) => {
        socket.join(roomName);
        logger.debug(`Socket ${socket.id} joined room: ${roomName}`);

        // INSTANT DATA EMISSION LOGIC
        
        // Case 1: Joined Global Live Room
        if (roomName === GLOBAL_LIVE) {
            const allMatches = cache.getAll();
            if (allMatches.length > 0) {
                socket.emit('live_matches_summary', allMatches);
                logger.debug(`Sent cached summary to ${socket.id}`);
            }
        }

        // Case 2: Joined Fixtures Room
        if (roomName === FIXTURES) {
            const fixtures = fixturesCache.get();
            if (fixtures && fixtures.length > 0) {
                socket.emit('fixtures_data', fixtures);
                logger.debug(`Sent cached fixtures to ${socket.id}`);
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
    });

    // Handle Leave Room (Optional, usually automatic on disconnect)
    socket.on('leave_room', (roomName) => {
        socket.leave(roomName);
        logger.debug(`Socket ${socket.id} left room: ${roomName}`);
    });
};
