import React from 'react';
import './App.css';
import {createStore} from  'redux';
import {Provider} from 'react-redux';
import Map from './Map';

class Terrain{
	constructor(type){
		this.type=type;
		switch(type){
			case "grass":
			case "ground":
				this.canMoveThrough=true;
				break;
			case "rock":
			case "player":
			case "enemy":
				this.canMoveThrough=false;
				break;
			default:
				throw type+" is not a valid terrain type";
		}
	}
}

let createValley=(mapH=20, mapW=20)=>{
  let land=[];
  for(let i=0; i<mapH; i++){
		let newStrip=[];
		for(let j=0;j<mapW;j++){
			newStrip.push(new Terrain("grass"));
		}
    land.push(newStrip)
  }
  
	
	
  function wall(i,j,chance){
    if(i<0 || j<0 || i>=mapH || j>=mapW) return 0;
    if(land[i][j].type==="grass"){
      if(Math.floor(Math.random() * chance)<10){
        land[i][j]=new Terrain("rock");
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
        land[i][j]=new Terrain("rock");
        growWall(i,j)
      }
    }
  }
  
  return land;
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

let generateMap=(landType="valley", mapH=20, mapW=20, enemyNumbers)=>{
	const enemyStats={
		ogre:{
			health:100,
			atk:11,
			def:8
		},
		goblin:{
			health:100,
			atk:11,
			def:8
		}
	}
		
	let map=new Object();
	
	switch(landType){
		case "valley":{
			map.land=createValley(mapH,mapW)
			break;
		}
		default:{
			throw landType+" is not a valid land type"
		}
	}

	map.enemies=[];
	
	for(let i=0;i<enemyNumbers.length;i++){
		for(let j=0;j<enemyNumbers[i].quantity;j++){
			
			let generateCoords=(recursiveCounter=0)=>{
				let coords={
					x:Math.floor(Math.random()*(map.land[0].length)),
					y:Math.floor(Math.random()*(map.land.length))
				};
				
				if(map.land[coords.y][coords.x].canMoveThrough && !(map.land[coords.y][coords.x].hasOwnProperty("occupied"))){
					return coords
				} else {
					if(recursiveCounter<100)
						return generateCoords(recursiveCounter+1);
					else
						throw "could not generate coordinates"
				}
			}
			
			let enemy={
				health:enemyStats[enemyNumbers[i].type].health,
				atk:enemyStats[enemyNumbers[i].type].atk,
				def:enemyStats[enemyNumbers[i].type].def,
				type:enemyNumbers[i].type,
				id:map.enemies.length,
				coords:generateCoords()
			};
			map.enemies.push(enemy);
			map.land[enemy.coords.y][enemy.coords.x].occupied=enemy.id;
		}
	}
	return map;
}

let generateShownMap=(state, currentMapId=0)=>{
	let borders={			//borders indicate the last visible squares, and are included in the visible map
		left:state.player.coords.x-state.viewRange,
		top:state.player.coords.y-state.viewRange,
		right:state.player.coords.x+state.viewRange,
		bottom:state.player.coords.y+state.viewRange
	}
	
	let mapW=state.maps[currentMapId].land[0].length;
	let mapH=state.maps[currentMapId].land.length;
	
	if(mapW>state.viewRange*2+1){
		if(borders.left<0){
			borders.right=state.viewRange*2;
			borders.left=0;
		}
		
		if(borders.right>mapW-1){
			borders.right=mapW-1;
			borders.left=borders.right-(state.viewRange*2);
		}
	} else {
		borders.left=0;
		borders.right=mapW-1;
	}
	
	if(mapH>state.viewRange*2+1){
		if(borders.top<0){
			borders.bottom=state.viewRange*2;
			borders.top=0;
		}
		
		if(borders.bottom>mapH-1){
			borders.bottom=mapH-1;
			borders.top=borders.bottom-(state.viewRange*2);
		}
	} else {
		borders.top=0;
		borders.bottom=mapH-1;
	}
	
	let shownMap=[]
	for(let y=borders.top;y<=borders.bottom;y++){
		let newStrip=[]
		for(let x=borders.left;x<=borders.right;x++){
			let square=state.maps[currentMapId].land[y][x];
			let type;
			if(square.hasOwnProperty("occupied")){
				if(square.occupied=="player")
					type="player";
				else
					type=state.maps[currentMapId].enemies[square.occupied].type;
			} else {
				type=square.type;
			}
			newStrip.push(type);
		}
		shownMap.push(newStrip)
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
		gameState:"playing",
		maps:[generateMap("valley", mapH, mapW, enemyNumbers)],
		squareSize:40,
		viewRange:4,
		currentMapId:0,
		//player
		//shownMap
	};
	
	let generateCoords=(recursiveCounter=0)=>{
		let map=initialState.maps[0];
		let coords={
			x:Math.floor(Math.random()*(map.land[0].length)),
			y:Math.floor(Math.random()*(map.land.length))
		};
		
		if(map.land[coords.y][coords.x].canMoveThrough && !(map.land[coords.y][coords.x].hasOwnProperty("occupied"))){
			return coords
		} else {
			if(recursiveCounter<50)
				return generateCoords(recursiveCounter+1);
			else
				throw "could not generate coordinates"
		}
	}
	
	initialState.player=playerStats;
	initialState.player.coords=generateCoords();
	
	initialState.maps[0].land[initialState.player.coords.y][initialState.player.coords.x].occupied="player";
	
	initialState.shownMap=generateShownMap(initialState)
	
	return initialState;
}

function reducer(state=initializeState(), action) {

	
	switch (action.type){
		case "KEYDOWN":
			let maps=JSON.parse(JSON.stringify(state.maps));
			let map=maps[state.currentMapId];
			let entity;
			let entityIsPlayer=(action.id=="player")
			if(entityIsPlayer){
				entity=Object.assign({},state.player)
			} else {
				entity=map.entities[action.id];
			}
			
			let newX=entity.coords.x;
			let newY=entity.coords.y;
			switch(action.key){
				case 'ArrowLeft':
					if(newX<=0) return state;
					newX--;
					break;
				case 'ArrowUp':
					if(newY<=0) return state;
					newY--;
					break;
				case 'ArrowRight':
					if(newX>=map.land[0].length-1) return state;
					newX++;
					break;
				case 'ArrowDown':
					if(newY>=map.land.length-1) return state;
					newY++;
					break;
				default:
					return state;
			}
			
			
			if(!map.land[newY][newX].canMoveThrough) return state;
			
			let newGameState=state.gameState;
			
			let battle=(entity,enemy)=>{
				let health=entity.health;
				let enemyHealth=enemy.health;
				while(health>0){
					enemyHealth-=(entity.atk-enemy.def);
					if(enemyHealth>0){
						health-=(enemy.atk-entity.def);
					} else {
						return health;
					}
				}
				return "loss";
			}
			
			
			if(map.land[newY][newX].hasOwnProperty("occupied")){
				let adversaryId=map.land[newY][newX].occupied;
				let result=battle(entity, map.enemies[adversaryId]);
				if((result=="loss" && entityIsPlayer) || (result!="loss" && !entityIsPlayer)){
					newGameState="Game Over";
					return state; //to remove and to add a game over screen
				} else {
					entity.health=result;
					map.enemies[adversaryId]="dead";
					delete map.land[newY][newX].occupied;
				}
			}
			
			map.land[newY][newX].occupied=map.land[entity.coords.y][entity.coords.x].occupied;
			delete map.land[entity.coords.y][entity.coords.x].occupied;
			
			entity.coords.x=newX;
			entity.coords.y=newY;
			
			let newState={
				gameState:newGameState,
				maps:maps,
				squareSize:state.squareSize,
				viewRange:state.viewRange,
				currentMapId:state.currentMapId,
				player:(entityIsPlayer)?entity:state.player
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
