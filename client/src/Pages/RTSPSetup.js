// client/src/Pages/RTSPSetup.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import "../Style/RTSPSetup.css";

const RTSPSetup = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    username: "",
    password: "",
    ip: "",
    port: "554",
    channel: "",
    stream: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Construct the backend payload
      const payload = {
        name: formData.name,
        location: formData.location,
        username: formData.username,
        password: formData.password,
        ip_address: formData.ip,
        port: formData.port,
        channel_number: formData.channel,
        stream_type: formData.stream,
      };

      // Call the backend API
      const response = await fetch("http://localhost:8080/api/cameras/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { detail } = await response.json();
        throw new Error(detail || "Failed to connect to the camera");
      }

      const data = await response.json();
      console.log("Camera connected successfully:", data);

      // Store camera data in localStorage
      localStorage.setItem("cameraData", JSON.stringify(data.data));

      // Redirect to the streaming page
      navigate(`/stream/${data.data._id}`);
    } catch (err) {
      console.error("Error connecting to the camera:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <a href="/" className="back-to-start">
        Back
      </a>
      <h2>Enter RTSP Stream Details</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Form Groups */}
        <div className="form-group">
          <label htmlFor="name">Camera Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Enter camera name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Camera Location:</label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="Enter camera location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Enter username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="ip">IP Address:</label>
          <input
            type="text"
            id="ip"
            name="ip"
            placeholder="Enter IP address"
            value={formData.ip}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="port">RTSP Port:</label>
          <input
            type="number"
            id="port"
            name="port"
            placeholder="Enter RTSP port (default: 554)"
            value={formData.port}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="channel">Channel Number:</label>
          <input
            type="number"
            id="channel"
            name="channel"
            placeholder="Enter channel number"
            value={formData.channel}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="stream">Stream Type:</label>
          <input
            type="text"
            id="stream"
            name="stream"
            placeholder="Enter stream type (01 for main, 02 for sub)"
            value={formData.stream}
            onChange={handleChange}
            required
          />
        </div>
        <button className="btn2" type="submit" disabled={loading}>
          {loading ? "Connecting..." : "Validate and Connect"}
        </button>
      </form>
    </div>
  );
};

export default RTSPSetup;
