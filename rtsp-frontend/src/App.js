import React from "react";
import WebSocketVideoStream from "./WebSocketVideoStream";

const App = () => {
  // Camera ID to connect (replace with your camera's ID)
  const cameraId = "67933ace221368b554c5e68a";

  return (
    <div className="App">
      <header className="App-header">
        <h1>RTSP Live Analytics</h1>
        <WebSocketVideoStream cameraId={cameraId} />
      </header>
    </div>
  );
};

export default App;
