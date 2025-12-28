const cron = require('node-cron');
const cronConfig = require('../config/cron');
const liveMatchService = require('./liveMatchService');
const fixturesService = require('./fixturesService');
const teamRankingService = require('./teamRanking');
const logger = require('../utils/logger');

/**
 * Initializes all cron jobs.
 * @param {object} io - Socket.io instance
 */
const initCronJobs = (io) => {
    logger.info('Initializing Cron Jobs...');

    // Live Score Update Job
    cron.schedule(cronConfig.LIVE_SCORE_UPDATE, async () => {
        try {
            const success = await liveMatchService.updateLiveMatches();
            if (success) {
                liveMatchService.broadcastUpdates(io);
            }
        } catch (error) {
            logger.error('Error in Live Score Cron Job:', error);
        }
    });

    logger.info(`Scheduled Live Score updates with pattern: ${cronConfig.LIVE_SCORE_UPDATE}`);
    
    // Fixtures Update Job
    cron.schedule(cronConfig.FIXTURES_UPDATE, async () => {
        try {
            const success = await fixturesService.updateFixtures();
            if (success) {
                fixturesService.broadcastFixtures(io);
            }
        } catch (error) {
            logger.error('Error in Fixtures Cron Job:', error);
        }
    });
    logger.info(`Scheduled Fixtures updates with pattern: ${cronConfig.FIXTURES_UPDATE}`);

    // Results Update Job
    cron.schedule(cronConfig.RESULTS_UPDATE, async () => {
        try {
            const success = await fixturesService.updateResults();
            if (success) {
                fixturesService.broadcastResults(io);
            }
        } catch (error) {
            logger.error('Error in Fixtures Cron Job:', error);
        }
    });
    logger.info(`Scheduled Results updates with pattern: ${cronConfig.RESULTS_UPDATE}`);

        // Team Ranking Update Job
    cron.schedule(cronConfig.RANKINGS_UPDATE, async () => {
        try {
            const success = await teamRankingService.updateTeamRanking();
            if (success) {
                teamRankingService.broadcastUpdates(io);
            }
        } catch (error) {
            logger.error('Error in Team Ranking Cron Job:', error);
        }
    });
    logger.info(`Scheduled Rankings updates with pattern: ${cronConfig.RANKINGS_UPDATE}`);
};

module.exports = { initCronJobs };
