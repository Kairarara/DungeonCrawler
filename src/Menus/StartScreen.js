import React from 'react';
import './EntityInfo.css';
import {connect} from 'react-redux';

let mapStateToProps=(state)=>{
	return {
		player:state.player,
		enemies:state.maps[state.currentMapId].enemies
	}
}

let EntityInfo=(props)=>{
	let entityIsPlayer=(props.entityId=="player")
	let entityType=(entityIsPlayer)?"player":"enemy";
	let entity;
	if(entityIsPlayer){
		entity=props.player;
	} else {
		entity=props.enemies[props.entityId];
	}
	let relativeHealth=Math.floor(entity.health/entity.maxHealth*100);
	let relativeExp=Math.floor(entity.exp/entity.lvl)
	console.log(entity)
	return(
		<div className={"entityInfo "+entityType+"Info"}>
			<img/>
			<Bar value={relativeExp+"%"}/>
			<Bar value={relativeHealth+"%"}/>
			<p>Atk:{entity.atk}</p>
			<p>Def:{entity.def}</p>
		</div>
	)
}

let Bar=(props)=>{
	return(
		<div className="bar playerHealth">
			<span style={{width: props.value}}></span>
		</div>
	)
}

export default connect(mapStateToProps)(EntityInfo);