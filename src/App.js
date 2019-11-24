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
class Terrain{
	constructor(type,canMoveThrough=true){
		this.type=type;
		this.canMoveThrough=canMoveThrough
	}
}

const terrains={
	grass:new Terrain("grass"),
	ground:new Terrain("ground"),
	rock:new Terrain("rock",false),
	player:new Terrain("player",false),
	enemy:new Terrain("enemy",false)
}

let createLand=(mapH=20, mapW=20,enemies=10)=>{
  let map=[];
  for(let i=0; i<mapH; i++){
    map.push(new Array(mapW).fill(terrains.grass))
  }
  
  function wall(i,j,chance){
    if(i<0 || j<0 || i>=mapH || j>=mapW) return 0;
    if(map[i][j]===terrains.grass){
      if(Math.floor(Math.random() * chance)<10){
        map[i][j]=terrains.rock;
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
        map[i][j]=terrains.rock;
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

class Entity{
	constructor(map,stats){
		this.stats=stats;
		
		let generateCoords=(recursiveCounter=0)=>{
			let coords={
				x:Math.floor(Math.random()*(map[0].length)),
				y:Math.floor(Math.random()*(map.length))
			};
			
			if(map[coords.y][coords.x].canMoveThrough){
				return coords
			} else {
				if(recursiveCounter<50)
					return generateCoords(recursiveCounter+1);
				else
					throw "could not generate coordinates"
			}
		}
		this.coords=generateCoords()
	}
}

let generateEnemies=(map, enemyNumbers)=>{
	const enemyStats={
		ogre:{
			health:100,
			atk:10,
			def:10
		},
		goblin:{
			health:100,
			atk:10,
			def:10
		}
	}
	
	let enemies=[];
	
	for(let i=0;i<enemyNumbers.length;i++){
		for(let j=0;j<enemyNumbers[i].quantity;j++){
			enemies.push(new Entity(map, enemyStats[enemyNumbers[i].type]));
		}
	}
	
	return enemies;
}

let generateShownMap=(state)=>{
	let borders={			//borders indicate the last visible squares, and are included in the visible map
		left:state.player.coords.x-state.viewRange,
		top:state.player.coords.y-state.viewRange,
		right:state.player.coords.x+state.viewRange,
		bottom:state.player.coords.y+state.viewRange
	}
	
	if(state.mapW>state.viewRange*2+1){
		if(borders.left<0){
			borders.right=state.viewRange*2;
			borders.left=0;
		}
		
		if(borders.right>state.mapW-1){
			borders.right=state.mapW-1;
			borders.left=borders.right-(state.viewRange*2);
		}
	} else {
		borders.left=0;
		borders.right=state.mapW-1;
	}
	
	if(state.mapH>state.viewRange*2+1){
		if(borders.top<0){
			borders.bottom=state.viewRange*2;
			borders.top=0;
		}
		
		if(borders.bottom>state.mapH-1){
			borders.bottom=state.mapH-1;
			borders.top=borders.bottom-(state.viewRange*2);
		}
	} else {
		borders.top=0;
		borders.bottom=state.mapH-1;
	}
	
	let shownMap=[]
	for(let i=borders.top;i<=borders.bottom;i++){
		shownMap.push(state.map[i].slice(borders.left,borders.right+1))
	}
	
	
	shownMap[state.player.coords.y-borders.top][state.player.coords.x-borders.left]=terrains.player
	
	for(let i=0;i<state.enemies.length;i++){
		if(state.enemies[i].coords.x>=borders.left&&state.enemies[i].coords.x<=borders.right&&state.enemies[i].coords.y>=borders.top&&state.enemies[i].coords.y<=borders.bottom)
			shownMap[state.enemies[i].coords.y-borders.top][state.enemies[i].coords.x-borders.left]=terrains.enemy
	}
	
	return shownMap;
}

const initializeState=(mapW=30,mapH=30)=>{
	let playerStats={
		health:100,
		atk:10,
		def:10
	}
	
	let enemyNumbers=[
		{
			quantity:5,
			type:"ogre"
		},
		{
			quantity:5,
			type:"goblin"
		},
	]
	
	let initialState={
		map:createLand(mapH,mapW),
		mapW:mapW,
		mapH:mapH,
		squareSize:40,
		viewRange:4,
	};
	
	initialState.player=new Entity(initialState.map, playerStats);
	initialState.enemies=generateEnemies(initialState.map, enemyNumbers);
	
	initialState.shownMap=generateShownMap(initialState)
	console.log(initialState)
	
	return initialState;
}

function reducer(state=initializeState(), action) {
	switch (action.type){
		case "KEYDOWN":
			let newX=state.player.coords.x;
			let newY=state.player.coords.y;
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
			
			
			if(!state.map[newY][newX].canMoveThrough) return state;
			
			let newState={
				mapH:state.mapH,
				mapW:state.mapW,
				map:state.map,
				viewRange:state.viewRange,
				player:{
					coords:{
						x:newX,
						y:newY
					}
				},
				enemies:state.enemies
			}
			newState.shownMap=generateShownMap(newState);
			
			return newState;
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
	<Provider store={store}>
		<div className="app">
			<Map/>
		</div>
	</Provider>
)

export default App;
export {terrains};
