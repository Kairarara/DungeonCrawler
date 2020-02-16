import React from "react";
import "./css/EndScreen.css";
import { connect } from "react-redux";

let mapStateToProps = state => {
  return {
    gameState: state.gameState
  };
};

let EndScreen =(props) => {
    return (
      <div className="EndScreen" style={(props.gameState!=="playing")?{"z-index":"100","opacity":"1"}:{"z-index":"-1","opacity":"0"}}>
        <h1>{props.gameState}</h1>
      </div>
    );
}

export default connect(mapStateToProps)(EndScreen);
