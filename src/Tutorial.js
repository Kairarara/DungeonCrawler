import React from "react";
import "./Tutorial.css";
import { connect } from "react-redux";

const Tutorial = props => {
  return (
    <div className="Tutorial">
      <div>
        <div className="imgContainer"><img src="Icons/arrows-icon.png"/></div>
        <p>Use the arrow keys to move</p>
      </div>
      <div>
        <div className="imgContainer"><img src="Icons/mouse-icon.png"/></div>
        <p>Click on enemies to show their stats</p>
      </div>
    </div>
  );
}

export default Tutorial;
