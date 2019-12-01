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
			def:4
		},
		goblin:{
			health:100,
			atk:11,
			def:3
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

let generateShownMap=(state, currentMap="map0")=>{
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
	for(let y=borders.top;y<=borders.bottom;y++){
		let newStrip=[]
		for(let x=borders.left;x<=borders.right;x++){
			let square=state[currentMap].land[y][x];
			let type;
			if(square.hasOwnProperty("occupied")){
				if(square.occupied=="player")
					type="player";
				else
					type=state[currentMap].enemies[square.occupied].type;
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
		map0:generateMap("valley", mapH, mapW, enemyNumbers),
		mapW:mapW,
		mapH:mapH,
		squareSize:40,
		viewRange:4,
	};
	
	let generateCoords=(recursiveCounter=0)=>{
		let map=initialState.map0;
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
	
	initialState.map0.land[initialState.player.coords.y][initialState.player.coords.x].occupied="player";
	
	initialState.shownMap=generateShownMap(initialState)
	
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
			let newPlayerHealth=state.player.stats.health;
			let newEnemies=state.enemies;
			
			let battle=(entity,enemy)=>{
				let health=entity.stats.health;
				let enemyHealth=enemy.stats.health;
				while(health>0){
					enemyHealth-=(entity.stats.atk-enemy.stats.def);
					if(enemyHealth>0){
						health-=(enemy.stats.atk-entity.stats.def);
					} else {
						return {
							health:health,
							enemyHealth:enemyHealth
						}
					}
				}
				return {
					health:health,
					enemyHealth:enemyHealth
				}
			}
			
			for(let i=0;i<state.enemies.length;i++){
				if(state.enemies[i].coords.x===newX&&state.enemies[i].coords.y===newY){
					let battleResults=battle(state.player,state.enemies[i]);
					if(battleResults.health<=0){
						return state
					} else {
						newPlayerHealth=battleResults.health;
						newEnemies=state.enemies.slice(0,i).concat(state.enemies.slice(i+1));
					}
				}
			}
			
			let newState={
				gameState:"playing",
				mapH:state.mapH,
				mapW:state.mapW,
				map:state.map,
				viewRange:state.viewRange,
				player:{
					stats:{
						atk:state.player.stats.atk,
						def:state.player.stats.def,
						health:newPlayerHealth
					},
					coords:{
						x:newX,
						y:newY
					}
				},
				enemies:newEnemies
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
