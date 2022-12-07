import { rand } from "./math.js";

class RayHit {
  constructor(side, xDist, yDist, xMap, yMap)
  {
    this.side = side;
    this.xDist = xDist;
    this.yDist = yDist;
    this.xMap = xMap;
    this.yMap = yMap;
  }
};

export class Tile {
  constructor(solid)
  {
    this.solid = solid;
  }
};

export class Map {
  constructor()
  {
    this.width = 16;
    this.height = 16;
    
    this.tiles = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      
      for (let x = 0; x < this.width; x++) {
        if (rand() > -0.4)
          row.push(new Tile(false));
        else
          row.push(new Tile(true));
      }
      
      this.tiles.push(row);
    }
    
    this.voidTile = new Tile(true);
  }
  
  getTile(x, y)
  {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return this.voidTile;
    }
    
    return this.tiles[y][x];
  }

  rayCast(rayPos, rayDir)
  {
    const xDeltaDist = Math.abs(1.0 / rayDir.x);
    const yDeltaDist = Math.abs(1.0 / rayDir.y);
    
    let xMap = Math.floor(rayPos.x);
    let yMap = Math.floor(rayPos.y);
    
    let xStep, yStep;
    let xSideDist, ySideDist;
    
    if (rayDir.x < 0) {
      xSideDist = (rayPos.x - xMap) * xDeltaDist;
      xStep = -1;
    } else {
      xSideDist = (xMap + 1 - rayPos.x) * xDeltaDist;
      xStep = 1;
    }
    
    if (rayDir.y < 0) {
      ySideDist = (rayPos.y - yMap) * yDeltaDist;
      yStep = -1;
    } else {
      ySideDist = (yMap + 1 - rayPos.y) * yDeltaDist;
      yStep = 1;
    }
    
    let side = false;
    while (!this.getTile(xMap, yMap).solid) {
      if (xSideDist < ySideDist) {
        xSideDist += xDeltaDist;
        xMap += xStep;
        side = true;
      } else {
        ySideDist += yDeltaDist;
        yMap += yStep;
        side = false;
      }
    }
    
    const xDist = xSideDist - xDeltaDist;
    const yDist = ySideDist - yDeltaDist;
    
    return new RayHit(side, xDist, yDist, xMap, yMap);
  }
};
