import React, { useState, useEffect } from "react";
import "../Style/VisitorVirtue.css";

const VisitorVirtue = () => {
  const [counts, setCounts] = useState({
    highest_count: 0,
    male_count: 0,
    female_count: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/highest_count")
        .then((response) => response.json())
        .then((data) => {
          setCounts(data);
        })
        .catch((error) => console.error("Error fetching data:", error));
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="app-container">
      {/* <a href="/" className="back-to-start">Back</a> */}
      <h2>CrowdIQ</h2>
      <h3>SEE BEYOND THE CROWD</h3>
      <div className="container">
        <div className="count-panel">
          <h1>Total Visitors</h1>
          <div className="count">{counts.highest_count}</div>
        </div>
        <div className="count-panel">
          <h1>Males</h1>
          <div className="count">{counts.male_count}</div>
        </div>
        <div className="count-panel">
          <h1>Females</h1>
          <div className="count">{counts.female_count}</div>
        </div>
      </div>
      <div className="button-container">
        <button className="btn3" onClick={() => (window.location.href = "/video")}>
          Video Tracking
        </button>
      </div>
      <footer>
        Powered by <span className="bold-text">DevelMo</span>
      </footer>
    </div>
  );
};

export default VisitorVirtue;
