import React from 'react';
import logo from './logo.svg';
import './App.css';

/*terrain types are:
	-grass
	-ground
	-rock
	-player
*/

let createLand=(mapH=10, mapW=30)=>{
  let map=[];
  for(let i=0; i<mapH; i++){
    map.push(new Array(mapW).fill("grass"))
  }
  
  function wall(i,j,chance){
    if(i<0 || j<0 || i>=mapH || j>=mapW) return 0;
    if(map[i][j]==="grass"){
      if(Math.floor(Math.random() * chance)<10){
        map[i][j]="rock";
        return true;
      }
    }
    return false;
  }

  function growWall(i,j,chance=10){
    let mod=20;//the bigger this value is the smaller the wall clusters are
    if(wall(i-1,j,chance))
      growWall(i-1,j,chance+mod);
    if(wall(i+1,j,chance))
      growWall(i+1,j,chance+mod);
    if(wall(i,j-1,chance))
      growWall(i,j-1,chance+mod);
    if(wall(i,j+1,chance))
      growWall(i,j+1,chance+mod);
  }

  for(let i=0;i<mapH;i++){
    for(let j=0;j<mapW;j++){
      if(Math.floor(Math.random() * 40)===0){
        map[i][j]="rock";
        growWall(i,j)
      }
    }
  }
  
  return map;
}




let createDungeon=(mapH=10, mapW=10, nOfTunnels=10, maxL=5, turns=5)=>{
  let map=[];
  for(let i=0; i<mapH; i++){
    map.push(new Array(mapW).fill("rock"))
  }
  
  
  let createTunnel=(startL, startW, maxL, turns)=>{
    let l=startL, w=startW;
    for(let i=0;i<turns;i++){
      let x=0, y=0;
      switch(Math.floor(Math.random()*4)){
        case 0:
          y=1;
          break;
        case 1:
          x=1;
          break;
        case 2:
          y=-1;
          break;
        case 3:
          x=-1;
          break;
      }
      let length=Math.floor(Math.random()*maxL)+1;
      
      for(let i=0;i<length;i++){
        l+=y;
        w+=x;
        map[l][w]="ground";
      }
    }
  }
  let startL=mapH/2-1;
  let startW=mapW/2-1;
  map[startL][startW]=1;
  createTunnel(startL, startW, maxL, turns);
  
  return map;
}

class App extends React.Component{
  constructor() {
    super();
    this.state = {
      
    };
  }
  
  render(){
    
    return(
      <div className="app">
        <Map mapW={20} mapH={20}/>
      </div>
    )
  }
}

class Map extends React.Component{
  constructor(props){
    super(props);
		
		
		let playerX=Math.floor(this.props.mapW/2);
		let playerY=Math.floor(this.props.mapH/2);
		const viewRange=4;
		
		let borders={			//borders indicate the last visible squares, and are included in the visible map
			left:(playerX<viewRange)?0:(playerX-viewRange),
			top:(playerY<viewRange)?0:(playerY-viewRange),
			right:(playerX>(this.props.mapW-viewRange-1))?this.props.mapW-1:(playerX+viewRange),
			bottom:(playerY>(this.props.mapH-viewRange-1))?this.props.mapH-1:(playerY+viewRange)
		}
		
		let map=createLand(this.props.mapH, this.props.mapW);
		
		
		let shownMap=[]
		for(let i=borders.top;i<=borders.bottom;i++){
			shownMap.push(map[i].slice(borders.left,borders.right+1))
		}
		shownMap[playerY-borders.top][playerX-borders.left]="player"
		
    this.state={
      map:map,
			shownMap:shownMap,
			squareSize:40,
			viewRange:viewRange,
			playerX:playerX,
			playerY:playerY
    }
  }
	
	handleKeyPress=(e)=>{
		let newX=this.state.playerX;
		let newY=this.state.playerY;
		switch(e.key){
			case 'ArrowLeft':
				if(newX>0)
					newX--;
				break;
			case 'ArrowUp':
				if(newY>0)
					newY--;
				break;
			case 'ArrowRight':
				if(newX<this.props.mapW-1)
					newX++;
				break;
			case 'ArrowDown':
				if(newY<this.props.mapH-1)
					newY++;
				break;
			default:
				return 0;
		}
		
		const viewRange=this.state.viewRange;
		
		let borders={			//borders indicate the last visible squares, and are included in the visible map
			left:newX-viewRange,
			top:newY-viewRange,
			right:newX+viewRange,
			bottom:newY+viewRange
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
		
		let map=this.state.map;
		let shownMap=[]
		for(let i=borders.top;i<=borders.bottom;i++){
			shownMap.push(map[i].slice(borders.left,borders.right+1))
		}
		
		shownMap[newY-borders.top][newX-borders.left]="player"
		
		this.setState({
			playerX:newX,
			playerY:newY,
			shownMap:shownMap
		})
	}
  
  render(){
		let shownMap=this.state.shownMap.slice();
    //let map=this.state.map;
    let squares=[];
		let squareStyle={
			height:this.state.squareSize+"px",
			width:this.state.squareSize+"px"
		}
		
		
		
    for(let i=0;i<shownMap.length;i++){
      for(let j=0;j<shownMap[i].length;j++){
        squares.push(<Square type={shownMap[i][j]} style={squareStyle} key={i+" "+j}/>)
      }
    }
    let mapStyle={
      gridTemplateColumns: "repeat("+shownMap[0].length+", "+(this.state.squareSize+2)+"px)",
			width:(shownMap[0].length*(this.state.squareSize+2))+"px",
			height:(shownMap.length*(this.state.squareSize+2))+"px"
    };
		
    return(
      <div className="gameBoard" style={mapStyle} tabIndex="0"  onKeyDown={this.handleKeyPress}>
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

export default App;
