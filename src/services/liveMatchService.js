require('dotenv').config();
const { fetchData } = require('./fetchData');
const cache = require('../cache/liveMatches.cache');
const logger = require('../utils/logger');
const { MATCH_PREFIX, GLOBAL_LIVE } = require('../constants/rooms');

// API Configuration
// Ideally, these would be in a config file or constructed dynamically
const API_URL = `https://cricket.sportmonks.com/api/v2.0/livescores?api_token=${process.env.MATCH_API_TOKEN}&include=localteam,visitorteam,runs`;

// Logic to identify the ID from a match object
// Adjust this selector based on actual API response structure
const getMatchId = (match) => match.id;

/**
 * Fetches latest live scores and updates the cache.
 * Returns true if update was successful.
 */
const updateLiveMatches = async () => {
    logger.debug('Fetching live matches...');
    const data = await fetchData(API_URL);
    
    // Validate response structure (SportMonks usually returns { data: [...] })
    if (!data || !data.data || !Array.isArray(data.data)) {
        logger.error('Invalid API response structure', data);
        return false;
    }

    const matches = data.data;

    // Clear old cache? 
    // Strategy: Depending on requirements, we might want to keep old data if fetch fails,
    // but here we are replacing with fresh "live" data.
    // However, to avoid "blinking", we usually update existing entries.
    // For simplicity of this architecture step: We will upsert.

    matches.forEach(match => {
        const id = getMatchId(match);
        cache.set(id, match);
    });
    
    logger.info(`Updated cache with ${matches.length} live matches`);
    return true;
};

/**
 * Broadcasts the current cache state to relevant Socket.IO rooms.
 * @param {object} io - Socket.io instance
 */
const broadcastUpdates = (io) => {
    const matches = cache.getAll();

    // 1. Broadcast Summary to Global Live Room (e.g. for a list view)
    // We might want to send a lighter version here, but sending all for now.
    io.to(GLOBAL_LIVE).emit('live_matches_summary', matches);

    // 2. Broadcast Individual Match Data to Specific Rooms
    matches.forEach(match => {
        const id = getMatchId(match);
        const roomName = `${MATCH_PREFIX}${id}`;
        
        // Emitting data only to the specific room
        // Optimization: io.sockets.adapter.rooms.get(roomName) to check if anyone is listening
        // requires io.of("/").adapter... 
        // For standard socket.io:
        io.to(roomName).emit('match_data', match);
    });

    logger.debug(`Broadcasted updates to ${matches.length} match rooms and global room.`);
};

module.exports = { updateLiveMatches, broadcastUpdates };
