import React from "react";
import "./css/Tutorial.css";

const Tutorial = props => {
  return (
    <div className="Tutorial">
      <div>
        <div className="imgContainer"><img src="Icons/arrows-icon.png" alt="Arrow keys icon"/></div>
        <p>Use the arrow keys to move</p>
      </div>
      <div>
        <div className="imgContainer"><img src="Icons/mouse-icon.png" alt="Mouse icon"/></div>
        <p>Click on enemies to show their stats</p>
      </div>
    </div>
  );
}

export default Tutorial;
