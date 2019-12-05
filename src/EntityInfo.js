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
	let bars=[];
	let icon;
	let entityIsPlayer=(props.entityId=="player")
	let entityType=(entityIsPlayer)?"player":"enemy";
	let entity;
	if(entityIsPlayer){
		entity=props.player;
		bars.push(<Bar value={Math.floor(entity.exp/entity.lvl)+"%"} type="playerExp"/>);
		icon="Portraits/Player.gif"
	} else {
		entity=props.enemies[props.entityId];
	}
	
	let relativeHealth=Math.floor(entity.health/entity.maxHealth*100);
	bars.push(<Bar value={relativeHealth+"%"} type={(entityIsPlayer)?"playerHealth":"enemyHealth"}/>);
	
	console.log(entity)
	return(
		<div className={"info " + entityType}>
			<img src={icon}/>
			{bars}
			
			<p>Atk:{entity.atk}</p>
			<p>Def:{entity.def}</p>
		</div>
	)
}

let Bar=(props)=>{
	return(
		<div className={"bar "+props.type}>
			<span style={{width: props.value}}></span>
		</div>
	)
}

export default connect(mapStateToProps)(EntityInfo);