
import './App.css';
import LandingPage from './Pages/LandingPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import RTSPSetup from './Pages/RTSPSetup';
import VisitorVirtue from './Pages/VisitorVirtue';
import LivePage from "./Pages/LivePage";
import  LoginPage  from "./Pages/LoginPage"
// import GraphPage from './Pages/GraphPage';

const App = () => {
  return (
    <>
   <Router>
    <Routes>
      <Route path="/" element={<LandingPage/>}/>
      <Route path="/login" element={<LoginPage />} />  {/* Add Login Page Route */}
      <Route path="/RTSPSetup" element={<RTSPSetup/>}/>
      <Route path="/stream/:cameraId" element={<LivePage />} />
      <Route path="/VisitorVirtue" element={<VisitorVirtue/>}/>
      {/* <Route path="/GraphPage" element={<GraphPage/>}/> */}
    </Routes>
   </Router>
    </>
  );
}

export default App;
