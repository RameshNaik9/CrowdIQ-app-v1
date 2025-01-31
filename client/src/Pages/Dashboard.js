import React from 'react';
import Barchart from '../Components/Chart/Barchart';
import Piechart from '../Components/Chart/Piechart';

const Dashboard = () => {
  return (
    <div>
      <Barchart />
      <Piechart />
    </div>
  );
}

export default Dashboard;