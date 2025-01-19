import React, { useEffect, useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import io from "socket.io-client";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

// Connect to the WebSocket server
const socket = io("http://localhost:3000"); // Replace with your server URL

const RealTimeCharts = () => {
  const [data, setData] = useState({
    male_count: 0,
    female_count: 0,
  });
  const [timestamps, setTimestamps] = useState([]);
  const [maleData, setMaleData] = useState([]);
  const [femaleData, setFemaleData] = useState([]);

  useEffect(() => {
    // Listen for updates from the backend
    socket.on("updateData", (visitorData) => {
      const currentTime = new Date().toLocaleTimeString();

      // Update state with the latest data
      setData(visitorData);
      setTimestamps((prev) => [...prev, currentTime]);
      setMaleData((prev) => [...prev, visitorData.male_count]);
      setFemaleData((prev) => [...prev, visitorData.female_count]);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Data for Pie Chart
  const pieData = {
    labels: ["Men", "Women"],
    datasets: [
      {
        label: "Visitor Distribution",
        data: [data.male_count, data.female_count],
        backgroundColor: ["#007bff", "#ff6384"],
        hoverBackgroundColor: ["#0056b3", "#ff4c61"],
      },
    ],
  };

  // Data for Bar Chart
  const barData = {
    labels: timestamps,
    datasets: [
      {
        label: "Men",
        data: maleData,
        backgroundColor: "#007bff",
      },
      {
        label: "Women",
        data: femaleData,
        backgroundColor: "#ff6384",
      },
    ],
  };

  // Data for Line Chart
  const lineData = {
    labels: timestamps,
    datasets: [
      {
        label: "Men",
        data: maleData,
        borderColor: "#007bff",
        fill: false,
        tension: 0.3,
      },
      {
        label: "Women",
        data: femaleData,
        borderColor: "#ff6384",
        fill: false,
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h2>Real-Time Visitor Analytics</h2>
      {/* Pie Chart */}
      <div style={{ margin: "20px" }}>
        <h3>Pie Chart</h3>
        <Pie data={pieData} />
      </div>

      {/* Bar Chart */}
      <div style={{ margin: "20px" }}>
        <h3>Bar Graph</h3>
        <Bar data={barData} options={{ responsive: true }} />
      </div>

      {/* Line Chart */}
      <div style={{ margin: "20px" }}>
        <h3>Line Graph</h3>
        <Line data={lineData} options={{ responsive: true }} />
      </div>
    </div>
  );
};

export default RealTimeCharts;
