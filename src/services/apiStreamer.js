const cron = require('node-cron');

/**
 * Service to handle periodic API fetching and broadcasting via Socket.io.
 * Separates concerns of fetching, broadcasting, and scheduling.
 */

// -- Internal Helper Functions --

/**
 * Fetches data from a URL.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<any>} - The JSON data or null on error.
 */
const fetchData = async (url) => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s default timeout

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'AbortError') {
            console.error(`Fetch aborted for ${url} (timeout)`);
        } else {
            console.error(`Error fetching ${url}:`, error.message);
        }
        return null;
    }
};

/**
 * Broadcasts data to connected clients via Socket.io.
 * @param {object} io - Socket.io instance.
 * @param {string} eventName - Event name to emit.
 * @param {any} data - Data to emit.
 */
const broadcastData = (io, eventName, data) => {
    if (data) {
        io.emit(eventName, data);
        console.log(`Broadcasted ${eventName} data ${data}`);
    }
};

module.exports = { fetchData, broadcastData };


// /**
//  * Service to handle periodic API fetching and broadcasting via Socket.io.
//  * Designed to be robust, handling errors and timing correctly.
//  */

// /**
//  * Starts a polling stream for a specific API endpoint.
//  * 
//  * @param {object} io - The Socket.io server instance.
//  * @param {string} url - The API URL to fetch from.
//  * @param {number} interval - The polling interval in milliseconds.
//  * @param {string} eventName - The socket event name to broadcast data on.
//  * @returns {object} - Control object with a `stop` method.
//  */
// const startDataStream = (io, url, interval, eventName) => {
//     let timeoutId = null;
//     let isRunning = true;

//     const fetchData = async () => {
//         if (!isRunning) return;

//         try {
//             // Using AbortController for fetch timeout prevention
//             const controller = new AbortController();
//             const timeout = setTimeout(() => controller.abort(), interval - 100); // Abort just before next interval if needed, or constant timeout

//             // Fetch data
//             const response = await fetch(url, { signal: controller.signal });
//             clearTimeout(timeout);

//             if (!response.ok) {
//                 throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
//             }

//             const data = await response.json();

//             // Broadcast data
//             io.emit(eventName, data);
//             console.log(`[${new Date().toISOString()}] Broadcasted '${eventName}' from ${url}`);

//         } catch (error) {
//             if (error.name === 'AbortError') {
//                 console.error(`Fetch aborted for ${url} (timeout)`);
//             } else {
//                 console.error(`Error polling ${url}:`, error.message);
//             }
//         } finally {
//             // Schedule next poll only if running
//             if (isRunning) {
//                 timeoutId = setTimeout(fetchData, interval);
//             }
//         }
//     };

//     // Start the first fetch
//     fetchData();

//     // Return control references
//     return {
//         stop: () => {
//             isRunning = false;
//             if (timeoutId) clearTimeout(timeoutId);
//             console.log(`Stopped polling for ${eventName}`);
//         }
//     };
// };

// module.exports = { startDataStream };
