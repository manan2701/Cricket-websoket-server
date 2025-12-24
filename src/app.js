require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const socketInit = require('./sockets');
const { initCronJobs } = require('./services/cronService');

const app = express();
const server = http.createServer(app);

// Example CORS setup - Adjust for production
app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// Initialize Socket Handlers
socketInit(io);

// Initialize Cron Jobs
initCronJobs(io);

// Basic Health Check Route
app.get('/', (req, res) => {
    res.send({ status: 'ok', message: 'Cricket Live Score Server Running' });
});

module.exports = { app, server, io };
