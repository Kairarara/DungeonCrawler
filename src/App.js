import React from "react";
import "./App.css";
import { createStore } from "redux";
import { Provider } from "react-redux";
import Map from "./Map";
import ShownEntities from "./EntityInfo";
import EndScreen from "./EndScreen";
import Tutorial from "./Tutorial";

/*TODO:
  
*/

let pathFinder = (land, start, end, maxDistance) => {
  let map = JSON.parse(JSON.stringify(land));
  map[end.y][end.x].prev = "end";
  let borderSquares = [end];

  let getPath = ele => {
    let path = [];
    path.push(map[ele.y][ele.x].prev);

    let i = 0;
    let x = ele.x;
    let y = ele.y;
    while (map[y][x].prev !== "end" && i < maxDistance) {
      switch (path[path.length - 1]) {
        case "ArrowDown": {
          y++;
          break;
        }
        case "ArrowLeft": {
          x--;
          break;
        }
        case "ArrowUp": {
          y--;
          break;
        }
        case "ArrowRight": {
          x++;
          break;
        }
        default: {
          throw new Error(`Unexpected command stored on path[${path.length - 1}] in getPath functon`)
        }
      }
      i++;
      path.push(map[y][x].prev);
    }
    if (i > maxDistance) {
      throw new Error("Path is longer than max distance");
    }
    return path;
  };

  for (let i = 0; i < maxDistance; i++) {
    let newBorders = [];
    for (let i = 0; i < borderSquares.length; i++) {
      let ele = borderSquares[i];
      if (ele.y + 1 == start.y && ele.x == start.x) {
        map[ele.y + 1][ele.x].prev = "ArrowUp";
        return getPath(start);
      }
      if (ele.y - 1 == start.y && ele.x == start.x) {
        map[ele.y - 1][ele.x].prev = "ArrowDown";
        return getPath(start);
      }
      if (ele.y == start.y && ele.x + 1 == start.x) {
        map[ele.y][ele.x + 1].prev = "ArrowLeft";
        return getPath(start);
      }
      if (ele.y == start.y && ele.x - 1 == start.x) {
        map[ele.y][ele.x - 1].prev = "ArrowRight";
        return getPath(start);
      }

      if (
        ele.y + 1 < map.length &&
        !map[ele.y + 1][ele.x].hasOwnProperty("prev") &&
        map[ele.y + 1][ele.x].canMoveThrough &&
        !map[ele.y + 1][ele.x].hasOwnProperty("occupied")
      ) {
        map[ele.y + 1][ele.x].prev = "ArrowUp";
        newBorders.push({ y: ele.y + 1, x: ele.x });
      }
      if (
        ele.y - 1 >= 0 &&
        !map[ele.y - 1][ele.x].hasOwnProperty("prev") &&
        map[ele.y - 1][ele.x].canMoveThrough &&
        !map[ele.y - 1][ele.x].hasOwnProperty("occupied")
      ) {
        map[ele.y - 1][ele.x].prev = "ArrowDown";
        newBorders.push({ y: ele.y - 1, x: ele.x });
      }
      if (
        ele.x + 1 < map[0].length &&
        !map[ele.y][ele.x + 1].hasOwnProperty("prev") &&
        map[ele.y][ele.x + 1].canMoveThrough &&
        !map[ele.y][ele.x + 1].hasOwnProperty("occupied")
      ) {
        map[ele.y][ele.x + 1].prev = "ArrowLeft";
        newBorders.push({ y: ele.y, x: ele.x + 1 });
      }
      if (
        ele.x - 1 >= 0 &&
        !map[ele.y][ele.x - 1].hasOwnProperty("prev") &&
        map[ele.y][ele.x - 1].canMoveThrough &&
        !map[ele.y][ele.x - 1].hasOwnProperty("occupied")
      ) {
        map[ele.y][ele.x - 1].prev = "ArrowRight";
        newBorders.push({ y: ele.y, x: ele.x - 1 });
      }
    }
    borderSquares = newBorders;
  }

  return false;
};

class Terrain {
  constructor(type) {
    this.type = type;
    switch (type) {
      case "grass":
      case "ground":
        this.canMoveThrough = true;
        break;
      case "rock":
        this.canMoveThrough = false;
        break;
      default:
        throw new Error(type + " is not a valid terrain type");
    }
  }
}

let createValley = (mapH = 20, mapW = 20) => {
  let land = [];
  //initialize valley as having only grass terrain
  for (let i = 0; i < mapH; i++) {
    let newStrip = [];
    for (let j = 0; j < mapW; j++) {
      newStrip.push(new Terrain("grass"));
    }
    land.push(newStrip);
  }
  //!!IMPORTANT!! THIS FUNCTION MODIFIES THE LAND ARRAY
  let growWall = (i, j, chance = 100) => {
    let wall = (i, j, chance) => {
      if (i < 0 || j < 0 || i >= mapH || j >= mapW) return false;
      if (land[i][j].type === "grass") {
        if (Math.floor(Math.random() * 100) < chance) {
          land[i][j] = new Terrain("rock");
          return true;
        }
      }
      return false;
    };

    let reducedChance = chance-30;
    if (wall(i - 1, j, chance)) growWall(i - 1, j, reducedChance);
    if (wall(i + 1, j, chance)) growWall(i + 1, j, reducedChance);
    if (wall(i, j - 1, chance)) growWall(i, j - 1, reducedChance);
    if (wall(i, j + 1, chance)) growWall(i, j + 1, reducedChance);
  };


  //generate rock clusters
  for (let i = 0; i < mapH; i++) {
    for (let j = 0; j < mapW; j++) {
      if (Math.floor(Math.random() * 40) === 0) {
        land[i][j] = new Terrain("rock");
        growWall(i, j);
      }
    }
  }

  return land;
};

let generateMap = (landType = "valley", mapH = 20, mapW = 20, enemyNumbers) => {
  const enemyStats = {
    automaton: {
      maxHealth: 150,
      health: 150,
      atk: 11,
      def: 4,
      expBounty: 60
    },
    ghoul: {
      maxHealth: 100,
      health: 100,
      atk: 12,
      def: 2,
      expBounty: 70
    },
    dryad: {
      maxHealth: 70,
      health: 70,
      atk: 14,
      def: 0,
      expBounty: 80
    }
  };

  for(let enemy of enemyNumbers){
    let img= new Image();
    img.src = `Portraits/${enemy.type}.gif`;
  }

  let map = new Object();

  switch (landType) {
    case "valley": {
      map.land = createValley(mapH, mapW);
      break;
    }
    default: {
      throw new Error(landType + " is not a valid land type");
    }
  }

  map.enemies = [];

  for (let i = 0; i < enemyNumbers.length; i++) {
    for (let j = 0; j < enemyNumbers[i].quantity; j++) {
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
          if (recursiveCounter < 100)
            return generateCoords(recursiveCounter + 1);
          else throw new Error("could not generate coordinates");
        }
      };

      let enemy = {
        maxHealth: enemyStats[enemyNumbers[i].type].maxHealth,
        health: enemyStats[enemyNumbers[i].type].health,
        atk: enemyStats[enemyNumbers[i].type].atk,
        def: enemyStats[enemyNumbers[i].type].def,
        expBounty: enemyStats[enemyNumbers[i].type].expBounty,
        type: enemyNumbers[i].type,
        id: map.enemies.length,
        coords: generateCoords()
      };
      map.enemies.push(enemy);
      map.land[enemy.coords.y][enemy.coords.x].occupied = enemy.id;
    }
  }
  return map;
};

let generateShownMap = (state, currentMapId = 0) => {
  let borders = {
    //borders indicate the last visible squares, and are included in the visible map
    left: state.player.coords.x - state.viewRange,
    top: state.player.coords.y - state.viewRange,
    right: state.player.coords.x + state.viewRange,
    bottom: state.player.coords.y + state.viewRange
  };

  let mapW = state.maps[currentMapId].land[0].length;
  let mapH = state.maps[currentMapId].land.length;

  if (mapW > state.viewRange * 2 + 1) {
    if (borders.left < 0) {
      borders.right = state.viewRange * 2;
      borders.left = 0;
    }

    if (borders.right > mapW - 1) {
      borders.right = mapW - 1;
      borders.left = borders.right - state.viewRange * 2;
    }
  } else {
    borders.left = 0;
    borders.right = mapW - 1;
  }

  if (mapH > state.viewRange * 2 + 1) {
    if (borders.top < 0) {
      borders.bottom = state.viewRange * 2;
      borders.top = 0;
    }

    if (borders.bottom > mapH - 1) {
      borders.bottom = mapH - 1;
      borders.top = borders.bottom - state.viewRange * 2;
    }
  } else {
    borders.top = 0;
    borders.bottom = mapH - 1;
  }

  let shownMap = [];
  for (let y = borders.top; y <= borders.bottom; y++) {
    let newStrip = [];
    for (let x = borders.left; x <= borders.right; x++) {
      let square = state.maps[currentMapId].land[y][x];
      newStrip.push(square);
    }
    shownMap.push(newStrip);
  }

  return shownMap;
};

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

const store = createStore(reducer);

const App = () => (
  <Provider store={store}>
    <div className="App">
      <EndScreen />
      <ShownEntities />
      <Map />
      <Tutorial/>
    </div>
  </Provider>
);

export default App;
