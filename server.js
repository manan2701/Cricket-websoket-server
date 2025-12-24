const { server } = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
