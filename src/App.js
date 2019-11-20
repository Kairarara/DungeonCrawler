import React from 'react';
import './App.css';
import {createStore} from  'redux';
import {Provider} from 'react-redux';
import Map from './Map';

/*terrain types are:
	-grass
	-ground
	-rock
	-player
*/

let createLand=(mapH=20, mapW=20)=>{
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



/*
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
*/


const initializeState=(mapW=30,mapH=30)=>(
	{
		squareSize:40,
		viewRange:4,
		mapW:mapW,
		mapH:mapH,
		map:createLand(mapH,mapW),
		playerX:15,
		playerY:15
	}
)

function reducer(state=initializeState(), action) {
	switch (action.type){
		case "KEYDOWN":
			let newX=state.playerX;
			let newY=state.playerY;
			switch(action.key){
				case 'ArrowLeft':
					if(newX>0)
						newX--;
					break;
				case 'ArrowUp':
					if(newY>0)
						newY--;
					break;
				case 'ArrowRight':
					if(newX<state.mapW-1)
						newX++;
					break;
				case 'ArrowDown':
					if(newY<state.mapH-1)
						newY++;
					break;
				default:
					return state;
			}
			
			if(state.map[newY][newX]=="rock") return state;
			
			return {
				mapH:state.mapH,
				mapW:state.mapW,
				map:state.map,
				squareSize:state.squareSize,
				viewRange:state.viewRange,
				playerX:newX,
				playerY:newY
			}
		case "NEWMAP":
			return {
				
			}
		case "":
			return {
				
			}
		default:
			return state;
	}
	
  return state;
}

const store=createStore(reducer);

const App =()=>(
	<Provider store={store} className="app">
		<Map/>
	</Provider>
)

export default App;
