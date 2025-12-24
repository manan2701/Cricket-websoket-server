require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const { startDataStream } = require('./src/services/apiStreamer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust in production to specific domains
        methods: ["GET", "POST"]
    }
});

// -- Polling Setup --

// Example 1: Fetching Fixtures every 5 seconds
const fixturesStream = startDataStream(
    io, 
    `https://cricket.sportmonks.com/api/v2.0/fixtures?api_token=${process.env.MATCH_API_TOKEN}&filter[season_id]=1730`, 
    '*/5 * * * * *', // Run every 5 seconds
    'fixtures'
);

// Example 2: Fetching Commentary every 10 seconds
const commentaryStream = startDataStream(
    io, 
    'https://jsonplaceholder.typicode.com/todos/2', 
    '*/10 * * * * *', // Run every 10 seconds 
    'match_commentary'
);

// Handling Client Connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Optional: Send initial data or welcome message
    socket.emit('welcome', { message: 'Connected to Cricket WebSocket Server' });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Active Data Streams:');
    console.log('- match_score (5s)');
    console.log('- match_commentary (10s)');
});

// Graceful Shutdown capability
process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');
    fixturesStream.stop();
    commentaryStream.stop();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = { app, server, io };

