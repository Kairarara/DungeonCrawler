import React from "react";
import "./EndScreen.css";
import { connect } from "react-redux";

let mapStateToProps = state => {
  return {
    gameState: state.gameState
  };
};

class EndScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div className="EndScreen" style={(this.props.gameState!=="playing")?{"z-index":"100","opacity":"1"}:{"z-index":"-1","opacity":"0"}}>
        <h1>{this.props.gameState}</h1>
      </div>
    );
  }
}

export default connect(mapStateToProps)(EndScreen);
