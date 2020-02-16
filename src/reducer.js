import {pathFinder, generateMap, generateShownMap} from "./mapHandler"

const initializeState = (mapW = 30, mapH = 30) => {
  let foundPath = false;
  let initialState;

  while (!foundPath) {
    //we check that every enemy is reachable by the player
    let player = {
      exp: 0,
      lvl: 1,
      maxHealth: 100,
      health: 100,
      atk: 10,
      def: 10,
      id: "player"
    };

    let enemyNumbers = [
      {
        quantity: 7,
        type: "automaton"
      },
      {
        quantity: 6,
        type: "ghoul"
      },
      {
        quantity: 5,
        type: "dryad"
      }
    ];

    let map = generateMap("valley", mapH, mapW, enemyNumbers);

    let generateCoords = (recursiveCounter = 0) => {
      let coords = {
        x: Math.floor(Math.random() * map.land[0].length),
        y: Math.floor(Math.random() * map.land.length)
      };

      if (
        map.land[coords.y][coords.x].canMoveThrough &&
        !map.land[coords.y][coords.x].hasOwnProperty("occupied")
      ) {
        return coords;
      } else {
        if (recursiveCounter < 50) return generateCoords(recursiveCounter + 1);
        else throw new Error("could not generate coordinates");
      }
    };

    player.coords = generateCoords();

    for (let i = 0; i < map.enemies.length; i++) {
      foundPath = pathFinder(
        map.land,
        player.coords,
        map.enemies[i].coords,
        (mapH * mapW) / 2
      );
      if (foundPath === false) break;
    }

    initialState = {
      gameState: "playing",
      maps: [map],
      squareSize: 40,
      viewRange: 5,
      currentMapId: 0,
      shownInfoId: null,
      player: player,
      movementEnabled: true
      //shownMap
    };
  }

  initialState.maps[0].land[initialState.player.coords.y][
    initialState.player.coords.x
  ].occupied = "player";

  initialState.shownMap = generateShownMap(initialState);

  return initialState;
};

function reducer(state = initializeState(), action) {
  /*
    @params:  the map, including enemies data
              the moving entity
              the key pressed (or simulated) to move the entity
              newPlayer is needed if entity is not the player to allow for a battle, 
                as the playier is not included in the map parameter

    @return:  gamestate, can be "playing", "Game Over" or "Victory"
  */
  let moveEntity = (map, entity, key, newPlayer) => {
    let newX = entity.coords.x;
    let newY = entity.coords.y;
    if (!newPlayer && !entity.id === "player") {
      throw new Error(
        "moveEntity needs a newPlayer argument if entity is not the player"
      );
    }
    switch (key) {
      case "ArrowLeft":
        if (newX <= 0) return "playing";
        newX--;
        break;
      case "ArrowUp":
        if (newY <= 0) return "playing";
        newY--;
        break;
      case "ArrowRight":
        if (newX >= map.land[0].length - 1) return "playing";
        newX++;
        break;
      case "ArrowDown":
        if (newY >= map.land.length - 1) return "playing";
        newY++;
        break;
      default:
        return "playing";
    }

    if (!map.land[newY][newX].canMoveThrough) return "playing";

    let battle = (entity, enemy) => {
      let health = entity.health;
      let enemyHealth = enemy.health;
      let dmg1 = entity.atk - enemy.def;
      if (dmg1 < 0) dmg1 = 0;
      let dmg2 = enemy.atk - entity.def;
      if (dmg2 < 0) dmg2 = 0;

      while (health > 0) {
        enemyHealth -= dmg1;
        if (enemyHealth > 0) {
          health -= dmg2;
        } else {
          return {
            won: true,
            health: health,
            enemyHealth: 0
          };
        }
      }
      return {
        won: false,
        health: 0,
        enemyHealth: enemyHealth
      };
    };

    if (map.land[newY][newX].hasOwnProperty("occupied")) {
      let adversary;
      let adversaryId = map.land[newY][newX].occupied;
      if (adversaryId == "player") {
        adversary = newPlayer;
      } else {
        adversary = map.enemies[adversaryId];
      }
      let result = battle(entity, adversary);
      if (
        (!result.won && entity.id == "player") ||
        (result.won && adversary.id == "player")
      ) {
        return "Game Over"; //!TODO: remove and to add a game over screen
      } else {
        if (entity.id == "player") {
          entity.health = result.health;
          entity.exp += map.enemies[adversary.id].expBounty;
          let expCap = entity.lvl * 100;
          while (entity.exp > expCap) {
            entity.exp -= expCap;
            entity.lvl++;
            entity.atk++;
            entity.def++;
            expCap += 100;
          }
          map.enemies[adversary.id] = "dead";

          map.land[newY][newX].occupied =
            map.land[entity.coords.y][entity.coords.x].occupied;
          delete map.land[entity.coords.y][entity.coords.x].occupied;

          entity.coords.x = newX;
          entity.coords.y = newY;
        } else {
          adversary.health = result.enemyHealth;
          adversary.exp += map.enemies[entity.id].expBounty;
          let expCap = adversary.lvl * 100;
          while (adversary.exp > expCap) {
            adversary.exp -= expCap;
            adversary.lvl++;
            adversary.atk++;
            adversary.def++;
            expCap += 100;
          }
          map.enemies[entity.id] = "dead";
          delete map.land[entity.coords.y][entity.coords.x].occupied;
        }
        for (let enemy of map.enemies) {
          if (enemy !== "dead") return "playing";
        }
        return "Victory";
      }
    } else {
      map.land[newY][newX].occupied =
        map.land[entity.coords.y][entity.coords.x].occupied;
      delete map.land[entity.coords.y][entity.coords.x].occupied;

      entity.coords.x = newX;
      entity.coords.y = newY;
    }
    return "playing";
  };

  switch (action.type) {
    case "KEYDOWN": {
      if (state.gameState !== "playing") return state;
      let newGameState = state.gameState;
      let newMaps = JSON.parse(JSON.stringify(state.maps));
      let map = newMaps[state.currentMapId];
      let newPlayer = Object.assign({}, state.player);

      newGameState = moveEntity(map, newPlayer, action.key);

      let newState = {
        gameState: newGameState,
        maps: newMaps,
        squareSize: state.squareSize,
        viewRange: state.viewRange,
        currentMapId: state.currentMapId,
        player: newPlayer,
        shownInfoId: state.shownInfoId,
        movementEnabled: false
      };
      newState.shownMap = generateShownMap(newState);

      return newState;
    }
    case "ENEMYTURN": {
      if (state.gameState !== "playing") return state;
      let newGameState = state.gameState;
      let newMaps = JSON.parse(JSON.stringify(state.maps));
      let map = newMaps[state.currentMapId];
      let newPlayer = Object.assign({}, state.player);

      map.enemies.forEach(enemy => {
        if (enemy !== "dead") {
          let path = pathFinder(map.land, enemy.coords, newPlayer.coords, 5);
          if (path) {
            newGameState = moveEntity(map, enemy, path[0], newPlayer);
          }
        }
      });

      let newState = {
        gameState: newGameState,
        maps: newMaps,
        squareSize: state.squareSize,
        viewRange: state.viewRange,
        currentMapId: state.currentMapId,
        player: newPlayer,
        shownInfoId: state.shownInfoId,
        movementEnabled: true
      };
      newState.shownMap = generateShownMap(newState);

      return newState;
    }
    case "SHOWINFO": {
      let newState = {
        gameState: state.gameState,
        maps: state.maps,
        squareSize: state.squareSize,
        viewRange: state.viewRange,
        currentMapId: state.currentMapId,
        player: state.player,
        shownMap: state.shownMap,
        shownInfoId: action.id,
        movementEnabled: state.movementEnabled
      };
      return newState;
    }
    case "": {
      let newState = {
        gameState: state.gameState,
        maps: state.maps,
        squareSize: state.squareSize,
        viewRange: state.viewRange,
        currentMapId: state.currentMapId,
        player: state.player,
        shownMap: state.shownMap,
        shownInfoId: state.shownInfoId,
        movementEnabled: state.movementEnabled
      };
      return newState;
    }
    default:
      return state;
  }
}

export default reducer;
