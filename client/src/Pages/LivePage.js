// client/src/Pages/LivePage.js

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import WebSocketVideoStream from "../components/WebSocketVideoStream";
import "../Style/LivePage.css"; // Optional: Create this for styling

const LivePage = () => {
  const { cameraId } = useParams();
  const navigate = useNavigate();
  const [cameraData, setCameraData] = useState(null);
  const [inferenceStarted, setInferenceStarted] = useState(false);
  const [inferenceMessage, setInferenceMessage] = useState("");
  const [inferenceError, setInferenceError] = useState("");
  const [isInferenceLoading, setIsInferenceLoading] = useState(false);

  useEffect(() => {
    // Retrieve camera data from localStorage
    const storedCameraData = localStorage.getItem("cameraData");
    if (storedCameraData) {
      const parsedData = JSON.parse(storedCameraData);
      if (parsedData._id === cameraId) {
        setCameraData(parsedData);
      } else {
        setInferenceError("Camera data not found for the provided ID.");
        // Optionally, fetch camera data from backend here
      }
    } else {
      setInferenceError("No camera data found. Please set up the camera first.");
      // Optionally, fetch camera data from backend here
    }

    // Retrieve inference state from localStorage
    const storedInferenceState = localStorage.getItem(`inference_${cameraId}`);
    if (storedInferenceState === "started") {
      setInferenceStarted(true);
    }
  }, [cameraId]);

  const handleStartInference = async () => {
    if (!cameraData) {
      setInferenceError("Camera data is not available.");
      return;
    }

    setIsInferenceLoading(true);
    setInferenceMessage("");
    setInferenceError("");

    try {
      const payload = {
        camera_id: cameraData._id,
        rtsp_url: cameraData.stream_link,
      };

      const response = await fetch("http://localhost:8000/start-inference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || "Failed to start inference.");
      }

      const data = await response.json();
      console.log("Inference started successfully:", data);

      setInferenceMessage(data.message || "Inference started successfully.");
      setInferenceStarted(true);
      localStorage.setItem(`inference_${cameraId}`, "started");
    } catch (err) {
      console.error("Error starting inference:", err.message);
      setInferenceError(err.message);
    } finally {
      setIsInferenceLoading(false);
    }
  };

  return (
    <div className="live-page-container">
      <header className="live-page-header">
        <h1>Live Camera Stream</h1>
        <a href="/" className="back-to-setup">
          Back to Setup
        </a>
      </header>
      <main className="live-page-main">
        {cameraData ? (
          <div className="camera-details">
            <h2>Camera Details</h2>
            <p>
              <strong>Name:</strong> {cameraData.name}
            </p>
            <p>
              <strong>Location:</strong> {cameraData.location}
            </p>
            <p>
              <strong>IP Address:</strong> {cameraData.ip_address}
            </p>
            <p>
              <strong>Stream Link:</strong>{" "}
              <a href={cameraData.stream_link} target="_blank" rel="noopener noreferrer">
                {cameraData.stream_link}
              </a>
            </p>
            {/* "Start Inference" button is shown only if inference hasn't started */}
            {!inferenceStarted && (
              <button
                className="btn-start-inference"
                onClick={handleStartInference}
                disabled={isInferenceLoading}
              >
                {isInferenceLoading ? "Starting Inference..." : "Start Inference"}
              </button>
            )}
            {/* Show success or error messages */}
            {inferenceMessage && <p className="success-message">{inferenceMessage}</p>}
            {inferenceError && <p className="error-message">{inferenceError}</p>}
          </div>
        ) : (
          <p>Loading camera details...</p>
        )}

        {/* Render the WebSocketVideoStream component only if inference has started */}
        {inferenceStarted && <WebSocketVideoStream cameraId={cameraId} />}
      </main>
    </div>
  );
};

export default LivePage;
