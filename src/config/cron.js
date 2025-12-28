const { RANKINGS } = require("../constants/rooms");

module.exports = {
    LIVE_SCORE_UPDATE: '*/30 * * * * *', // Every 5 seconds
    FIXTURES_UPDATE: '*/30 * * * * *',   // Every 30 seconds
    RESULTS_UPDATE: '*/30 * * * * *',   // Every 30 seconds
    RANKINGS_UPDATE: '*/30 * * * * *'   // Every 30 seconds
};
