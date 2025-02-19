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
        {/* Form Fields */}
        {[
          { label: "Camera Name", name: "name", type: "text", placeholder: "Enter camera name" },
          { label: "Camera Location", name: "location", type: "text", placeholder: "Enter camera location" },
          { label: "Username", name: "username", type: "text", placeholder: "Enter username" },
          { label: "Password", name: "password", type: "password", placeholder: "Enter password" },
          { label: "IP Address", name: "ip", type: "text", placeholder: "Enter IP address" },
          { label: "RTSP Port", name: "port", type: "number", placeholder: "Enter RTSP port (default: 554)" },
          { label: "Channel Number", name: "channel", type: "number", placeholder: "Enter channel number" },
          { label: "Stream Type", name: "stream", type: "text", placeholder: "Enter stream type (01 for main, 02 for sub)" }
        ].map(({ label, name, type, placeholder }) => (
          <div key={name} className="form-group">
            <label htmlFor={name}>{label}:</label>
            <input
              type={type}
              id={name}
              name={name}
              placeholder={placeholder}
              value={formData[name]}
              onChange={handleChange}
              required
            />
          </div>
        ))}

        <button className="btn2" type="submit" disabled={loading}>
          {loading ? "Connecting..." : "Validate and Connect"}
        </button>
      </form>
    </div>
  );
};

export default RTSPSetup;
