const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");

// Load environment variables
dotenv.config({ path: "./.env" });

const app = require("./app");

// Create HTTP server and integrate with WebSocket (Socket.io)
const server = http.createServer(app);
const io = socketIo(server);

// Database Connection
const DB = "mongodb://localhost:27017/googleOAuth";

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection established");
  })
  .catch((err) => {
    console.log("DB CONNECTION FAILED");
    console.log("ERR: ", err);
  });

// WebSocket Connection for Real-Time Updates
io.on("connection", (socket) => {
  console.log("Client connected for live log updates");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Function to notify clients when logs update
const notifyClients = (log) => {
  io.emit("newLog", log);
};

// Export `io` to use in controllers
module.exports.io = io;

// Catching uncaught exception ->>
process.on("unCaughtException", (err) => {
  console.log(`UNCAUGHT EXCEPTION -> ${err.name} - ${err.message}`);
  console.log("App SHUTTING DOWN...");
	process.exit(1); // <- Then will shut down the server.
});

// Starting Server ->>
const port = process.env.PORT || 8080;
server.listen(port, () => {
  console.log(`App running at port ${port}...`);
});

// Catching unHandleled Rejections ->
process.on("unhandledRejection", (err) => {
	console.log(`UNHANDLED REJECTION -> ${err.name} - ${err.message}`);
	console.log(err);
	console.log("App SHUTTING DOWN...");
	server.close(() => {	// <- This will first terminate all requests
	process.exit(1); // <- Then will shut down the server.
});
});

