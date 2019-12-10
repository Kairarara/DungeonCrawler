import React from 'react';
import './Map.css';
import {connect} from 'react-redux';

let mapStateToProps=(state)=>{
	return {
		squareSize:state.squareSize,
		shownMap:state.shownMap,
		enemies:state.maps[state.currentMapId].enemies
	}
}

class Map extends React.Component{

	handleKeyDown=(e)=>{
		this.props.dispatch({
			type:"KEYDOWN",
			key:e.key,
			id:"player"
		})
	}
  
	handleSquareClick=(id)=>{
		if(id==null) return
		this.props.dispatch({
			type:"SHOWINFO",
			id:id
		})
	}
	
  render(){
    let squares=[];
		let squareStyle={
			height:this.props.squareSize+"px",
			width:this.props.squareSize+"px"
		}
		
    for(let i=0;i<this.props.shownMap.length;i++){
      for(let j=0;j<this.props.shownMap[i].length;j++){
				let square=this.props.shownMap[i][j];
				let type;
				if(square.hasOwnProperty("occupied")){
					if(square.occupied=="player")
						type="player";
					else
						type=this.props.enemies[square.occupied].type;
					squares.push(<Square type={type} style={squareStyle} key={i+" "+j} onClick={()=>this.handleSquareClick(square.occupied)}/>)
				} else {
					type=square.type;
					squares.push(<Square type={type} style={squareStyle} key={i+" "+j}/>)
				}
      }
    }
    let mapStyle={
      gridTemplateColumns: "repeat("+this.props.shownMap[0].length+", "+(this.props.squareSize+2)+"px)",
			width:(this.props.shownMap[0].length*(this.props.squareSize+2))+"px",
			height:(this.props.shownMap.length*(this.props.squareSize+2))+"px"
    };
		
    return(
      <div className="map" style={mapStyle} tabIndex="0"  onKeyDown={this.handleKeyDown}>
        {squares}
      </div>
    )
  }
}

class Square extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      type:this.props.type
    };
  }
  
	componentWillReceiveProps(nextProps) {
		this.setState({ type: nextProps.type });  
	}
	
  render(){
    let color;
    switch(this.state.type){
      case "ground":
        color="#9c7711"
        break;
      case "grass":
        color="#7ec850"
        break;
      case "rock":
        color="#5c4e29"
        break;
			case "player":
				color="#4287f5";
				break;
			case "goblin":
			case "ogre":
				color="#b51616";
				break;
      default:
        color="#000000"
    }
    let style=this.props.style;
	
    style={
	  height:this.props.style.height,
      background:color
    }
    
    
    return(
      <div className="square" style={style} onClick={this.props.onClick}/>
    )
  }
}

export default connect(mapStateToProps)(Map);