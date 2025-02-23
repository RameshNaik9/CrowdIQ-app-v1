// services/socketService.js
const WebSocket = require("ws");
const { processInferenceData } = require("../controllers/inferenceController");

let wss;

const startWebSocketServer = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on("connection", (ws) => {
        console.log("[WebSocket] Node.js WebSocket connected.");

        ws.on("message", async (message) => {
            try {
                console.log("[WebSocket] RAW message received:", message);
                const data = JSON.parse(message);
                console.log("[WebSocket] JSON-parsed data:", data);

                // Pass the data to the controller for DB updates
                await processInferenceData(data);

                // Acknowledge receipt
                ws.send(JSON.stringify({ message: "Inference result processed successfully." }));
            } catch (error) {
                console.error("[WebSocket] Error processing message:", error);
                ws.send(JSON.stringify({ error: "Failed to process message." }));
            }
        });

        ws.on("close", () => console.log("[WebSocket] Connection closed."));
        ws.on("error", (error) => console.error("[WebSocket] Error:", error));
    });

    console.log("[WebSocket] WebSocket server running.");
};

const broadcastMessage = (message) => {
    if (!wss) return;
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
};

module.exports = { startWebSocketServer, broadcastMessage };
