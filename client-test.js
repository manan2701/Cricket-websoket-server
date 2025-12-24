const { io } = require("socket.io-client");

const SERVER_URL = "http://localhost:3000";

console.log(`Connecting to ${SERVER_URL}...`);

const socket = io(SERVER_URL);

socket.on("connect", () => {
    console.log(`Connected with ID: ${socket.id}`);

    // Scenario 1: Join Global Live Room
    console.log("Joining 'live_all' room...");
    socket.emit("join_room", "live_all");

    // Scenario 2: Join Fixtures Room
    console.log("Joining 'fixtures' room...");
    socket.emit("join_room", "fixtures");

});

// Listener for Global Summary
socket.on("live_matches_summary", (data) => {
    console.log(`[${new Date().toLocaleTimeString()}] live_matches_summary received! Count: ${data.length}`);
    if (data.length > 0) {
        console.log("Sample Data:", JSON.stringify(data[0]).substring(0, 100) + "...");
    }
});

// Listener for Fixtures Data
socket.on("fixtures_data", (data) => {
    console.log(`[${new Date().toLocaleTimeString()}] fixtures_data received! Count: ${data.length}`);
    if (data.length > 0) {
        console.log("Closest Fixture:", JSON.stringify(data[0]).substring(0, 100) + "...");
    }
});

// Listener for Individual Match Data
socket.on("match_data", (data) => {
    console.log(`[${new Date().toLocaleTimeString()}] match_data received for ID: ${data.id}`);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});
