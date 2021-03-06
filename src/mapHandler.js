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

export {pathFinder, generateMap, generateShownMap};
