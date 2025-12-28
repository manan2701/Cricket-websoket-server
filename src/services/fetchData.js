const logger = require('../utils/logger');
const axios = require('axios');

/**
 * Fetches data from a URL with a timeout.
 * @param {string} url - The URL to fetch.
 * @param {number} timeoutMs - Timeout in milliseconds.
 * @returns {Promise<any>} - The JSON data or null on error.
 */
const fetchData = async (url, timeoutMs = 10000) => {
    try {
        const response = await axios.get(url, { timeout: timeoutMs });
        return response.data;
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            logger.error(`Fetch aborted for ${url} (timeout)`);
        } else if (error.response) {
            logger.error(`HTTP Error fetching ${url}: ${error.response.status} ${error.response.statusText || ''}`);
        } else {
            logger.error(`Error fetching ${url}: ${error.message}`);
        }
        return null; // Return null so the caller handles it gracefully
    }
};

module.exports = { fetchData };
