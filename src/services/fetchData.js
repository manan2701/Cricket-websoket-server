const logger = require('../utils/logger');

/**
 * Fetches data from a URL with a timeout.
 * @param {string} url - The URL to fetch.
 * @param {number} timeoutMs - Timeout in milliseconds.
 * @returns {Promise<any>} - The JSON data or null on error.
 */
const fetchData = async (url, timeoutMs = 10000) => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            logger.error(`Fetch aborted for ${url} (timeout)`);
        } else {
            logger.error(`Error fetching ${url}:`, error.message);
        }
        return null; // Return null so the caller handles it gracefully
    }
};

module.exports = { fetchData };
