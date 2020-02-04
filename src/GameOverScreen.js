import React from "react";
import "./GameOverScreen.css";
import { connect } from "react-redux";

let mapStateToProps = state => {
  return {
    gameState: state.gameState
  };
};

class GameOverScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div className="GameOverScreen" style={(this.props.gameState==="Game Over")?{"z-index":"100","opacity":"1"}:{"z-index":"-1","opacity":"0"}}>
        <h1>Game Over</h1>
      </div>
    );
  }
}

export default connect(mapStateToProps)(GameOverScreen);
