const groupDataByHour = (data) => {
    const hourlyData = {};
  
    // Process each record
    data.forEach(({ gender, time }) => {
      const hour = new Date(time).getHours();
      const hourLabel = `${hour}:00`;
  
      // Initialize if hour label does not exist
      if (!hourlyData[hourLabel]) {
        hourlyData[hourLabel] = { males: 0, females: 0, totals: 0 };
      }
  
      // Increment counts based on gender
      if (gender === "male") {
        hourlyData[hourLabel].males += 1;
      } else if (gender === "female") {
        hourlyData[hourLabel].females += 1;
      }
  
      // Increment total count
      hourlyData[hourLabel].totals += 1;
    });
  
    // Convert to chart-friendly format
    const times = Object.keys(hourlyData).sort();
    const males = times.map((time) => hourlyData[time].males);
    const females = times.map((time) => hourlyData[time].females);
    const totals = times.map((time) => hourlyData[time].totals);
  
    return { times, males, females, totals };
  };
  
  module.exports = { groupDataByHour };
  