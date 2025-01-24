// client/src/Pages/LivePage.js

import React from "react";
import { useParams } from "react-router-dom";
import WebSocketVideoStream from "../components/WebSocketVideoStream";
import "../Style/LivePage.css"; // Optional: Create this for styling

const LivePage = () => {
  // Extract cameraId from URL parameters
  const { cameraId } = useParams();

  return (
    <div className="live-page-container">
      <header className="live-page-header">
        <h1>Live Camera Stream</h1>
      </header>
      <main className="live-page-main">
        <WebSocketVideoStream cameraId={cameraId} />
      </main>
    </div>
  );
};

export default LivePage;
