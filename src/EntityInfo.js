import React from "react";
import "./css/EntityInfo.css";
import { connect } from "react-redux";

let mapStateToProps = state => {
  if (
    state.shownInfoId == "player" ||
    state.shownInfoId == null ||
    state.maps[state.currentMapId].enemies[state.shownInfoId] == "dead"
  ) {
    return { player: state.player };
  } else {
    return {
      player: state.player,
      enemy: state.maps[state.currentMapId].enemies[state.shownInfoId]
    };
  }
};

let ShownEntities = props => {
  if (props.enemy == null) {
    return (
      <div className="infoContainer">
        <EntityInfo entity={props.player} type="player" group="player" />
      </div>
    );
  } else {
    return (
      <div className="infoContainer">
        <EntityInfo entity={props.player} type="player" group="player" />
        <EntityInfo
          entity={props.enemy}
          type={props.enemy.type}
          group="enemy"
        />
      </div>
    );
  }
};

let EntityInfo = props => {
  let bars = [];
  let icon = `Portraits/${props.type}.gif`;
  let entityIsPlayer = props.type == "player";
  if (entityIsPlayer) {
    bars.push(
      <Bar
        value={props.entity.exp}
        maxValue={props.entity.lvl * 100}
        barType="Exp"
        entityType="player"
      />
    ); //exp needed for lvl up is level*100
  }

  bars.push(
    <Bar
      value={props.entity.health}
      maxValue={props.entity.maxHealth}
      barType="HP"
      entityType={entityIsPlayer ? "player" : "enemy"}
    />
  );

  let entityName = null;
  if (!entityIsPlayer) {
    entityName = <h1>{props.type[0].toUpperCase() + props.type.slice(1)}</h1>;
  }

  return (
    <div className={"info " + props.group}>
      <img className="icon" src={icon} alt={entityName+" portrait"} />
      {entityName}
      {bars}
      <h2>Atk:{props.entity.atk}</h2>
      <h2>Def:{props.entity.def}</h2>
    </div>
  );
};

let Bar = props => {
  let relativeValue = `${(props.value / props.maxValue) * 100}%`;
  return (
    <div className={`bar ${props.entityType + props.barType}`}>
      <div className="barValue">
        <h2>{`${props.barType}: ${props.value}`}</h2>
      </div>
      <span style={{ width: relativeValue }}></span>
    </div>
  );
};

export default connect(mapStateToProps)(ShownEntities);
