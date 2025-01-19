import React, { useState } from "react";
import "../Style/RTSPSetup.css"; // Assuming you use a separate CSS file for styling

const RTSPSetup = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    ip: "",
    port: "554",
    channel: "",
    stream: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("RTSP Data Submitted: ", formData);
    // Add your form submission logic here
  };

  return (
    <div className="form-container">
      <a href="/" className="back-to-start">Back</a>
      <h2>Enter RTSP Stream Details</h2>
      <form onSubmit={handleSubmit}>
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
        <button className="btn2" type="submit">Generate RTSP URL</button>
      </form>
    </div>
  );
};

export default RTSPSetup;
