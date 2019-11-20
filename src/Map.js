import React from 'react';
import {connect} from 'react-redux';

let mapStateToProps=(state)=>{
	return {
		squareSize:state.squareSize,
		viewRange:state.viewRange,
		mapW:state.mapW,
		mapH:state.mapH,
		map:state.map,
		playerX:state.playerX,
		playerY:state.playerY
	}
}

class Map extends React.Component{

	handleKeyDown=(e)=>{
		this.props.dispatch({
			type:"KEYDOWN",
			key:e.key
		})
	}
  
  render(){
		const viewRange=this.props.viewRange;
		
		let borders={			//borders indicate the last visible squares, and are included in the visible map
			left:this.props.playerX-viewRange,
			top:this.props.playerY-viewRange,
			right:this.props.playerX+viewRange,
			bottom:this.props.playerY+viewRange
		}
		
		if(this.props.mapW>viewRange*2+1){
			if(borders.left<0){
				borders.right=viewRange*2;
				borders.left=0;
			}
			
			if(borders.right>this.props.mapW-1){
				borders.right=this.props.mapW-1;
				borders.left=borders.right-(viewRange*2);
			}
		} else {
			borders.left=0;
			borders.right=this.props.mapW-1;
		}
		
		if(this.props.mapH>viewRange*2+1){
			if(borders.top<0){
				borders.bottom=viewRange*2;
				borders.top=0;
			}
			
			if(borders.bottom>this.props.mapH-1){
				borders.bottom=this.props.mapH-1;
				borders.top=borders.bottom-(viewRange*2);
			}
		} else {
			borders.top=0;
			borders.bottom=this.props.mapH-1;
		}
		
		let map=this.props.map;
		let shownMap=[]
		for(let i=borders.top;i<=borders.bottom;i++){
			shownMap.push(map[i].slice(borders.left,borders.right+1))
		}
		
		shownMap[this.props.playerY-borders.top][this.props.playerX-borders.left]="player"
    
    let squares=[];
		let squareStyle={
			height:this.props.squareSize+"px",
			width:this.props.squareSize+"px"
		}
		
		
		
    for(let i=0;i<shownMap.length;i++){
      for(let j=0;j<shownMap[i].length;j++){
        squares.push(<Square type={shownMap[i][j]} style={squareStyle} key={i+" "+j}/>)
      }
    }
    let mapStyle={
      gridTemplateColumns: "repeat("+shownMap[0].length+", "+(this.props.squareSize+2)+"px)",
			width:(shownMap[0].length*(this.props.squareSize+2))+"px",
			height:(shownMap.length*(this.props.squareSize+2))+"px"
    };
		
    return(
      <div className="gameBoard" style={mapStyle} tabIndex="0"  onKeyDown={this.handleKeyDown}>
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
      default:
        color="#000000"
    }
    let style=this.props.style;
	
    style={
	  height:this.props.style.height,
      background:color
    }
    
    
    return(
      <div className="square" style={style}/>
    )
  }
}

export default connect(mapStateToProps)(Map);