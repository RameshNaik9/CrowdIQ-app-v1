const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/Config/db"); // MongoDB connection
const setupSocketHandlers = require("./src/Sockets/socketmanager");

const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL, // Allow requests from your frontend
    methods: ["GET", "POST"],
  },
});

// Connect to the database
connectDB();

// Use the WebSocket handlers
setupSocketHandlers(io);

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
