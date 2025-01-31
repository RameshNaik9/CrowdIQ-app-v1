import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import socket from "../../Sockets/Socket"; // Import your WebSocket setup
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarChart = () => {
  const [chartData, setChartData] = useState({
    labels: [], // Hourly intervals
    datasets: [
      {
        label: "Male Count",
        data: [], // Male counts per hour
        backgroundColor: "rgba(54, 162, 235, 0.6)", // Blue
      },
      {
        label: "Female Count",
        data: [], // Female counts per hour
        backgroundColor: "rgba(255, 99, 132, 0.6)", // Pink
      },
      {
        label: "Total Count",
        data: [], // Total counts per hour
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Green
      },
    ],
  });

  useEffect(() => {
    // Request chart data from the server
    socket.emit("fetch_hourly_data");

    // Listen for incoming hourly data from the server
    socket.on("hourly_data", (data) => {
      const { times, maleCounts, femaleCounts, totalCounts } = data;

      setChartData({
        labels: times, // Update time intervals
        datasets: [
          {
            label: "Male Count",
            data: maleCounts,
            backgroundColor: "rgba(54, 162, 235, 0.6)",
          },
          {
            label: "Female Count",
            data: femaleCounts,
            backgroundColor: "rgba(255, 99, 132, 0.6)",
          },
          {
            label: "Total Count",
            data: totalCounts,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      });
    });

    // Cleanup listener on unmount
    return () => {
      socket.off("hourly_data");
    };
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time (Hourly Intervals)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Count",
        },
      },
    },
  };

  return (
    <div style={{ width: "80%", margin: "auto" }}>
      <h2>Hourly Visitors Count</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
