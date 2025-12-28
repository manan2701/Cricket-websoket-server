const { io } = require("socket.io-client");
const fs = require("fs");
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
    socket.emit("join_room", "upcoming_matches");

    console.log("Joining 'results' room...");
    socket.emit("join_room", "results");

    console.log("Joining 'rankings' room...");
    socket.emit("join_room", "rankings");

    console.log("Joining 'match_66707' room...");
    socket.emit("join_room", "match_66707");

});

// Listener for Global Summary
socket.on("live_matches_summary", (data) => {
    fs.writeFileSync('../debug_live_summary.json', JSON.stringify(data, null, 2));
    console.log(`[${new Date().toLocaleTimeString()}] live_matches_summary received! Count: ${data}`);
});


// Listener for Fixtures Data
// socket.on("upcoming_matches_summary", (data) => {
//     fs.writeFileSync('../match_fixtures.json', JSON.stringify(data, null, 2));
//     console.log(`[${new Date().toLocaleTimeString()}] upcoming_matches_summary received!`);
// });

// Listener for Individual Match Data
socket.on("match_data", (data) => {
    console.log(`[${new Date().toLocaleTimeString()}] match_data received for ID: ${data.id}`);
    fs.writeFileSync('../debug_live_match_data_' + data.id + '.json', JSON.stringify(data, null, 2));
});

// socket.on("result_matches_summary", (data) => {
//     fs.writeFileSync('../match_result.json', JSON.stringify(data, null, 2));
//     console.log(`[${new Date().toLocaleTimeString()}] result_matches_summary received!`);

// });

// socket.on("team_ranking_summary", (data) => {
//     fs.writeFileSync('../team_ranking_summary.json', JSON.stringify(data, null, 2));
//     console.log(`[${new Date().toLocaleTimeString()}] team_ranking_summary received! `);

// });

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});
