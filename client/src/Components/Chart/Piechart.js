import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import socket from "../../Sockets/Socket"; // Import your WebSocket setup
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = () => {
  const [counts, setCounts] = useState({
    male: 0,
    female: 0,
    total: 0,
  });

  const [chartData, setChartData] = useState({
    labels: ["Male", "Female", "Total"],
    datasets: [
      {
        label: "Visitors Distribution",
        data: [0, 0, 0], // Initial data
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)", // Blue
          "rgba(255, 99, 132, 0.6)", // Pink
          "rgba(75, 192, 192, 0.6)", // Green
        ],
        hoverOffset: 4,
      },
    ],
  });

  useEffect(() => {
    // Listen for new person data
    socket.on("new_person_data", (data) => {
      // Update counts based on gender
      const updatedCounts = { ...counts };

      if (data.gender === "male") {
        updatedCounts.male += 1;
      } else if (data.gender === "female") {
        updatedCounts.female += 1;
      }

      updatedCounts.total += 1;

      setCounts(updatedCounts);

      // Update chart data dynamically
      setChartData({
        labels: ["Male", "Female", "Total"],
        datasets: [
          {
            label: "Visitors Distribution",
            data: [updatedCounts.male, updatedCounts.female, updatedCounts.total],
            backgroundColor: [
              "rgba(54, 162, 235, 0.6)", // Blue
              "rgba(255, 99, 132, 0.6)", // Pink
              "rgba(75, 192, 192, 0.6)", // Green
            ],
            hoverOffset: 4,
          },
        ],
      });
    });

    return () => {
      socket.off("new_person_data"); // Cleanup listener on unmount
    };
  }, [counts]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div style={{ width: "60%", margin: "auto" }}>
      <h2>Visitors Distribution</h2>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
