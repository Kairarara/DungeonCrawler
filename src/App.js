import React from 'react';
import logo from './logo.svg';
import './App.css';

function logMap(map){
  for(let i=0;i<map.length;i++){
    console.log(map[i])
  }
}

let mapLength=10;
let mapWidth=20;




let createLand=(mapL=10, mapW=10)=>{
  let map=[];
  for(let i=0; i<mapL; i++){
    map.push(new Array(mapW).fill(0))
  }
  
  function wall(i,j,chance){
    if(i<0 || j<0 || i>=mapL || j>=mapW) return 0;
    if(map[i][j]===0){
      if(Math.floor(Math.random() * chance)<10){
        map[i][j]=1;
        return 1;
      }
    }
    return 0;
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

  for(let i=0;i<mapL;i++){
    for(let j=0;j<mapW;j++){
      if(Math.floor(Math.random() * 40)===0){
        map[i][j]=1;
        growWall(i,j)
      }
    }
  }
  
  return map;
}




let createDungeon=(mapL=10, mapW=10, nOfTunnels=10, maxL=5, turns=5)=>{
  let map=[];
  for(let i=0; i<mapL; i++){
    map.push(new Array(mapW).fill(0))
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
        map[l][w]=1;
      }
    }
  }
  let startL=mapL/2-1;
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
        <Map/>
      </div>
    )
  }
}

class Map extends React.Component{
  constructor(props){
    super(props);
    this.state={
      map:createLand()
    }
  }
  
  render(){
    let map=this.state.map;
    let squares=[];
    for(let i=0;i<map.length;i++){
      for(let j=0;j<map[i].length;j++){
        squares.push(<Square type={map[i][j]}/>)
      }
    }
    let style={
      gridTemplateColumns: "repeat("+map[0].length+", 52px)"
    };
    return(
      <div className="gameBoard" style={style}>
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
  
  render(){
    let color;
    switch(this.state.type){
      case "earth":
        color="#112233"
        break;
      case "grass":
        color="#7ec850"
        break;
      default:
        color="#000000"
    }
    let style={
      background:color
    }
    
    
    return(
      <div className="square" style={style}/>
    )
  }
}

export default App;
