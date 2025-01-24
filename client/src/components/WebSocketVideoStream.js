import React, { useEffect, useRef, useState } from "react";

const WebSocketVideoStream = ({ cameraId }) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const imgRef = useRef(null);
  const wsRef = useRef(null);
  const previousUrlRef = useRef(null); // To store the previous Blob URL

  useEffect(() => {
    let reconnectInterval;

    const connectWebSocket = () => {
      const ws = new WebSocket(`ws://localhost:8000/ws/${cameraId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnected(true);
        setError(null);
        if (reconnectInterval) clearInterval(reconnectInterval);
      };

      ws.onmessage = (event) => {
        const blob = new Blob([event.data], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);

        // Revoke the previous URL to free up memory
        if (previousUrlRef.current) {
          URL.revokeObjectURL(previousUrlRef.current);
        }

        // Store the new URL
        previousUrlRef.current = url;

        if (imgRef.current) {
          imgRef.current.src = url;
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        setError("WebSocket connection error");
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setConnected(false);
        reconnectInterval = setInterval(connectWebSocket, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectInterval) clearInterval(reconnectInterval);
      // Revoke the last Blob URL when the component unmounts
      if (previousUrlRef.current) {
        URL.revokeObjectURL(previousUrlRef.current);
      }
    };
  }, [cameraId]);

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Live Processed Video Stream</h2>
      {connected ? <p>Status: Connected</p> : <p>Status: {error || "Disconnected"}</p>}
      <img ref={imgRef} alt="Live video stream" style={{ width: "80%", border: "1px solid black" }} />
    </div>
  );
};

export default WebSocketVideoStream;
