const registerRoomHandlers = require('./roomHandler');
const logger = require('../utils/logger');

module.exports = (io) => {
    io.on('connection', (socket) => {
        logger.info(`Client connected: ${socket.id}`);

        // Register handlers
        registerRoomHandlers(io, socket);

        socket.on('disconnect', () => {
            logger.info(`Client disconnected: ${socket.id}`);
        });
    });
};
