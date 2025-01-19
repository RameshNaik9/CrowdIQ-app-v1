
import './App.css';
import LandingPage from './Pages/LandingPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import RTSPSetup from './Pages/RTSPSetup';
import VisitorVirtue from './Pages/VisitorVirtue';
// import GraphPage from './Pages/GraphPage';
function App() {
  return (
    <>
   <Router>
    <Routes>
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/RTSPSetup" element={<RTSPSetup/>}/>
      <Route path="/VisitorVirtue" element={<VisitorVirtue/>}/>
      {/* <Route path="/GraphPage" element={<GraphPage/>}/> */}
    </Routes>
   </Router>
    </>
  );
}

export default App;
