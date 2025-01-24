import React from "react";
import '../Style/LandingPage.css' 

const LandingPage = () => {
  return (
    <div className="landing-page">
      <h1 className="website-name">CrowdIQ</h1>
      <h3 className="heading">SEE BEYOND THE CROWD</h3>
      <button className="btn1"onClick={() => (window.location.href = "/RTSPSetup")}>Start</button>
      <footer>
        Powered by <span className="bold-text">DevelMo</span>
      </footer>
    </div>
  );
};

export default LandingPage;
