import React from 'react';
import './EntityInfo.css';
import {connect} from 'react-redux';

let mapStateToProps=(state)=>{
	if(state.shownInfoId=="player"	||
		state.shownInfoId==null		||
		state.maps[state.currentMapId].enemies[state.shownInfoId]=="dead"){
		return {player:state.player}
	} else  {
		return {
			player:state.player,
			enemy:state.maps[state.currentMapId].enemies[state.shownInfoId],
		}
	}
}

let ShownEntities=(props)=>{
	if(props.enemy==null){
		return(
			<div className="infoContainer">
				<EntityInfo entity={props.player} type="player" group="player"/>
			</div>
		)
	} else {
		return(
			<div className="infoContainer">
				<EntityInfo entity={props.player} type="player" group="player"/>
				<EntityInfo entity={props.enemy} type={props.enemy.type} group="enemy"/>
			</div>
		)
	}
}

let EntityInfo=(props)=>{
	let bars=[];
	let icon="Portraits/"+props.type+".gif";
	let entityIsPlayer=(props.type=="player")
	if(entityIsPlayer){
		bars.push(<Bar value={Math.floor(props.entity.exp/props.entity.lvl)+"%"} type="playerExp"/>);
	}
	
	let relativeHealth=Math.floor(props.entity.health/props.entity.maxHealth*100);
	bars.push(<Bar value={relativeHealth+"%"} type={(entityIsPlayer)?"playerHealth":"enemyHealth"}/>);
	
	return(
		<div className={"info " + props.group}>
			<img className="icon" src={icon}/>
			{bars}
			
			<p>Atk:{props.entity.atk}</p>
			<p>Def:{props.entity.def}</p>
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

export default connect(mapStateToProps)(ShownEntities);