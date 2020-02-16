import React from "react";
import "./css/Map.css";
import { connect } from "react-redux";

let mapStateToProps = state => {
  return {
    squareSize: state.squareSize,
    shownMap: state.shownMap,
    enemies: state.maps[state.currentMapId].enemies,
    movementEnabled: state.movementEnabled
  };
};

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    this.mapRef.current.focus();
  }

  handleKeyDown = e => {
    if (
      this.props.movementEnabled &&
      (e.key == "ArrowLeft" ||
        e.key == "ArrowUp" ||
        e.key == "ArrowDown" ||
        e.key == "ArrowRight")
    ) {
      this.props.dispatch({
        type: "KEYDOWN",
        key: e.key,
        id: "player"
      });
      setTimeout(
        () =>
          this.props.dispatch({
            type: "ENEMYTURN"
          }),
        100
      );
    }
  };

  handleSquareClick = id => {
    if (id == null) return;
    this.props.dispatch({
      type: "SHOWINFO",
      id: id
    });
  };

  render() {
    let squares = [];
    let squareStyle = {
      height: this.props.squareSize + "px",
      width: this.props.squareSize + "px"
    };

    for (let i = 0; i < this.props.shownMap.length; i++) {
      for (let j = 0; j < this.props.shownMap[i].length; j++) {
        let square = this.props.shownMap[i][j];
        let type;
        if (square.hasOwnProperty("occupied")) {
          if (square.occupied == "player") {
            type = "player";
          } else {
            type = this.props.enemies[square.occupied].type;
          }
          squares.push(
            <Square
              type={type}
              style={squareStyle}
              key={i + " " + j}
              onClick={() => this.handleSquareClick(square.occupied)}
            />
          );
        } else {
          type = square.type;
          squares.push(
            <Square type={type} style={squareStyle} key={i + " " + j} />
          );
        }
      }
    }
    let mapStyle = {
      gridTemplateColumns:
        "repeat(" +
        this.props.shownMap[0].length +
        ", " +
        this.props.squareSize +
        "px)",
      width: this.props.shownMap[0].length * this.props.squareSize + "px",
      height: this.props.shownMap.length * this.props.squareSize + "px"
    };

    return (
      <div
        className="map"
        style={mapStyle}
        tabIndex="0"
        onKeyDown={this.handleKeyDown}
        ref={this.mapRef}
      >
        {squares}
      </div>
    );
  }
}

class Square extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: this.props.type
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ type: nextProps.type });
  }

  render() {
    let style = this.props.style;

    style = {
      height: this.props.style.height
    };
    switch (this.state.type) {
      case "ground":
        style.background = "#9c7711";
        break;
      case "grass":
        style.background = "#7ec850";
        break;
      case "rock":
        style.background = "#5c4e29";
        break;
      case "player":
        style.background = "#4287f5";
        break;
      case "ghoul":
        style.background = "#6e3434";
        break;
      case "automaton":
        style.background = "#b51616";
        break;
      case "dryad":
        style.background = "#214a26";
        break;
      default:
        style.background = "#000000";
    }

    return (
      <div className="square" style={style} onClick={this.props.onClick} />
    );
  }
}

export default connect(mapStateToProps)(Map);
