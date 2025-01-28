// const io = require("socket.io")(server);
// const mongoose = require("mongoose");
// const Data = require("../Models/data"); // MongoDB model for your data
// const { groupDataByHour } = require("../Utils/statsUtils"); // Utility for grouping data

// io.on("connection", (socket) => {
//   console.log("Client connected:", socket.id);

//   // Handle request for hourly data
//   socket.on("fetch_hourly_data", async () => {
//     try {
//       // Fetch all records from the database
//       const rawData = await Data.find({}, { gender: 1, time: 1 }).exec();

//       // Process raw data into hourly intervals
//       const hourlyData = groupDataByHour(rawData);

//       // Emit the processed data to the client
//       const response = {
//         times: hourlyData.times,         // Hourly labels like ["10:00", "11:00"]
//         maleCounts: hourlyData.males,   // Male counts per hour
//         femaleCounts: hourlyData.females, // Female counts per hour
//         totalCounts: hourlyData.totals, // Total counts per hour
//       };

//       socket.emit("hourly_data", response);
//     } catch (error) {
//       console.error("Error fetching hourly data:", error);
//       socket.emit("error", "Failed to fetch hourly data. Please try again.");
//     }
//   });

//   // Listen for real-time database changes and emit updates
//   const changeStream = Data.watch(); // MongoDB change stream to monitor inserts
//   changeStream.on("change", (change) => {
//     if (change.operationType === "insert") {
//       const newData = change.fullDocument; // Get the inserted document
//       io.emit("new_person_data", newData); // Broadcast new data to all connected clients
//     }
//   });

//   // Handle client disconnection
//   socket.on("disconnect", () => {
//     console.log("Client disconnected:", socket.id);
//   });
// });
const mongoose = require("mongoose");
const Data = require("../Models/data"); // MongoDB model for data
const { groupDataByHour } = require("../Utils/statsUtils"); // Utility for grouping data

const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Handle request for hourly data
    socket.on("fetch_hourly_data", async () => {
      try {
        const rawData = await Data.find({}, { gender: 1, time: 1 }).exec();
        const hourlyData = groupDataByHour(rawData);

        const response = {
          times: hourlyData.times,
          maleCounts: hourlyData.males,
          femaleCounts: hourlyData.females,
          totalCounts: hourlyData.totals,
        };

        socket.emit("hourly_data", response);
      } catch (error) {
        console.error("Error fetching hourly data:", error);
        socket.emit("error", "Failed to fetch hourly data. Please try again.");
      }
    });

    // Listen for real-time database changes
    const changeStream = Data.watch();
    changeStream.on("change", (change) => {
      if (change.operationType === "insert") {
        const newData = change.fullDocument;
        io.emit("new_person_data", newData); // Broadcast new data to all clients
      }
    });

    // Handle client disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

module.exports = setupSocketHandlers;
