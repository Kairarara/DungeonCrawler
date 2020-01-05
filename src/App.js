import React from 'react';
import './App.css';
import {createStore} from  'redux';
import {Provider} from 'react-redux';
import Map from './Map';
import ShownEntities from './EntityInfo';
import {connect} from 'react-redux';

//app crashes when player and enemies move in the same square in the same turn

let pathFinder=(land,start,end,maxDistance)=>{
	let map=JSON.parse(JSON.stringify(land));
	map[end.y][end.x].prev="end";
	let borderSquares=[end]
	
	let getPath=(ele)=>{
		let path=[];
		path.push(map[ele.y][ele.x].prev);
	
		let i=0;
		let x=ele.x;
		let y=ele.y;
		while(map[y][x].prev!=="end"&&i<maxDistance){
			switch(path[path.length-1]){
				case "ArrowDown":{
					y++;
					break;
				}
				case "ArrowLeft":{
					x--;
					break;
				}
				case "ArrowUp":{
					y--;
					break;
				}
				case "ArrowRight":{
					x++;
					break;
				}
			}
			i++;
			path.push(map[y][x].prev);
		}
		if(i>maxDistance){
			throw "Path is longer than max distance"
		}
		return path;
	}
	
	
	for(let i=0;i<maxDistance;i++){
		let newBorders=[];
		for(let i=0;i<borderSquares.length;i++){
			let ele=borderSquares[i]
			if(ele.y+1<map.length && !map[ele.y+1][ele.x].hasOwnProperty("prev") && map[ele.y+1][ele.x].canMoveThrough){
				map[ele.y+1][ele.x].prev="ArrowUp";
				if((ele.y+1)==start.y && ele.x==start.x){
					return getPath(start);
				}
				
				newBorders.push({y:ele.y+1, x:ele.x});
			}
			if(ele.y-1>=0 && !map[ele.y-1][ele.x].hasOwnProperty("prev") && map[ele.y-1][ele.x].canMoveThrough){
				map[ele.y-1][ele.x].prev="ArrowDown";
				
				if((ele.y-1)==start.y && ele.x==start.x){
					return getPath(start);
				}
				
				newBorders.push({y:ele.y-1, x:ele.x});
			}
			if(ele.x+1<map[0].length && !map[ele.y][ele.x+1].hasOwnProperty("prev") && map[ele.y][ele.x+1].canMoveThrough){
				map[ele.y][ele.x+1].prev="ArrowLeft";
				
				if(ele.y==start.y && ele.x+1==start.x){
					return getPath(start);
				}
				
				newBorders.push({y:ele.y, x:ele.x+1});
			}
			if(ele.x-1>=0 && !map[ele.y][ele.x-1].hasOwnProperty("prev") && map[ele.y][ele.x-1].canMoveThrough){
				map[ele.y][ele.x-1].prev="ArrowRight";
				
				if(ele.y==start.y && (ele.x-1)==start.x){
					return getPath(start);
				}
				
				newBorders.push({y:ele.y, x:ele.x-1});
			}
		}
		borderSquares=newBorders;
	}
	
	return false;	
	
}



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

let pathIsPossible=(map,e1,e2)=>{
	let isPossible=false;
	//Breadth First Search 
	return isPossible;
  
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
			maxHealth:100,
			health:100,
			atk:11,
			def:2,
			expBounty:60
		},
		goblin:{
			maxHealth:100,
			health:100,
			atk:11,
			def:2,
			expBounty:60
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
				maxHealth:enemyStats[enemyNumbers[i].type].maxHealth,
				health:enemyStats[enemyNumbers[i].type].health,
				atk:enemyStats[enemyNumbers[i].type].atk,
				def:enemyStats[enemyNumbers[i].type].def,
				expBounty:enemyStats[enemyNumbers[i].type].expBounty,
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
			newStrip.push(square);
		}
		shownMap.push(newStrip)
	}
	
	return shownMap;
}

const initializeState=(mapW=30,mapH=30)=>{
	let foundPath=false;
	let initialState;
	
	while(!foundPath){			//we check that every enemy is reachable by the player
		let player={
			exp:0,
			lvl:1,
			maxHealth:100,
			health:100,
			atk:10,
			def:10,
			id:"player",
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
		];
		
		let map=generateMap("valley", mapH, mapW, enemyNumbers);
		
		
		
		let generateCoords=(recursiveCounter=0)=>{
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
		
		player.coords=generateCoords();
		
		for(let i=0;i<map.enemies.length;i++){
			foundPath=pathFinder(map.land, player.coords, map.enemies[i].coords, mapH*mapW/2);
			if(foundPath===false) break;
		}
		
		initialState={
			gameState:"playing",
			maps:[map],
			squareSize:40,
			viewRange:4,
			currentMapId:0,
			shownInfoId:null,
			player:player,
			//shownMap
		};
	}
	
	initialState.maps[0].land[initialState.player.coords.y][initialState.player.coords.x].occupied="player";
	
	initialState.shownMap=generateShownMap(initialState)
	
	return initialState;
}

function reducer(state=initializeState(), action) {
	
	switch (action.type){
		case "KEYDOWN":{
			let newGameState=state.gameState;
			let maps=JSON.parse(JSON.stringify(state.maps));
			let map=maps[state.currentMapId];
			let newPlayer=Object.assign({},state.player);
			let moveEntity=(entity,key)=>{
				let newX=entity.coords.x;
				let newY=entity.coords.y;
				
				switch(key){
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
				
				
				let battle=(entity,enemy)=>{
					let health=entity.health;
					let enemyHealth=enemy.health;
					let dmg1=entity.atk-enemy.def;
					if(dmg1<0) dmg1=0;
					let dmg2=enemy.atk-entity.def;
					if(dmg2<0) dmg2=0;
					
					let result;
					while(health>0){
						enemyHealth-=dmg1;
						if(enemyHealth>0){
							health-=dmg2;
						} else {
							return {
								won:true,
								health:health,
								enemyHealth:0
							};
						}
					}
					return {
						won:false,
						health:0,
						enemyHealth:enemyHealth
					};
				}
				
				
				if(map.land[newY][newX].hasOwnProperty("occupied")){
					let adversary;
					
							console.log(entity)
					let adversaryId=map.land[newY][newX].occupied;
					if(adversaryId=="player"){
						adversary=newPlayer;
					} else {
						adversary=map.enemies[adversaryId];
					}
					let result=battle(entity, adversary);
					if((!result.won && entity.id=="player") || (result.won && adversary.id=="player")){
						newGameState="Game Over";
						return state; //to remove and to add a game over screen
					} else {
						if(entity.id=="player"){
							entity.health=result.health;
							entity.exp+=map.enemies[adversary.id].expBounty;
							let expCap=entity.lvl*100;
							while(entity.exp>expCap){
								entity.exp-=expCap;
								entity.lvl++;
								entity.atk++;
								entity.def++;
								expCap+=100;
							}
							map.enemies[adversary.id]="dead";
							
							map.land[newY][newX].occupied=map.land[entity.coords.y][entity.coords.x].occupied;
							delete map.land[entity.coords.y][entity.coords.x].occupied;
							
							entity.coords.x=newX;
							entity.coords.y=newY;
							
						} else {
							adversary.health=result.enemyHealth;
							adversary.exp+=map.enemies[entity.id].expBounty;
							let expCap=adversary.lvl*100;
							while(adversary.exp>expCap){
								adversary.exp-=expCap;
								adversary.lvl++;
								adversary.atk++;
								adversary.def++;
								expCap+=100;
							}
							map.enemies[entity.id]="dead";
							delete map.land[entity.coords.y][entity.coords.x].occupied;
						}
					}
				} else {
					map.land[newY][newX].occupied=map.land[entity.coords.y][entity.coords.x].occupied;
					delete map.land[entity.coords.y][entity.coords.x].occupied;
					
					entity.coords.x=newX;
					entity.coords.y=newY;
				}
			};
			
			moveEntity(newPlayer,action.key);
			map.enemies.forEach((enemy)=>{
				if(enemy!=="dead"){
					let path=pathFinder(map.land,enemy.coords,newPlayer.coords,5);
					if(path){
						moveEntity(enemy,path[0]);
					}
				}
			})
			
			let newState={
				gameState:newGameState,
				maps:maps,
				squareSize:state.squareSize,
				viewRange:state.viewRange,
				currentMapId:state.currentMapId,
				player:newPlayer,
				shownInfoId:state.shownInfoId
			}
			newState.shownMap=generateShownMap(newState);
			
			return newState;
		}
		case "SHOWINFO":{
			let newState={
				gameState:state.gameState,
				maps:state.maps,
				squareSize:state.squareSize,
				viewRange:state.viewRange,
				currentMapId:state.currentMapId,
				player:state.player,
				shownMap:state.shownMap,
				shownInfoId:action.id,
			}
			return newState
		}
		case "":{
			let newState={
				gameState:state.gameState,
				maps:state.maps,
				squareSize:state.squareSize,
				viewRange:state.viewRange,
				currentMapId:state.currentMapId,
				player:state.player,
				shownMap:state.shownMap,
				shownInfoId:state.shownInfoId,
			}
			return newState
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
			<ShownEntities/>
			<Map autofocus/>
		</div>
	</Provider>
)








export default App;
