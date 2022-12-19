import { rand } from "../util//math.js";
import { fileLoad } from "../util/file.js";
import { spriteMapLoad } from "../gfx/spriteMap.js";

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

export class Map {
  constructor(spriteMap, width, height)
  {
    this.width = width;
    this.height = height;
    this.tiles = new Uint32Array(this.width * this.height);
    this.spriteMap = spriteMap;
    this.voidTile = 1;
  }
  
  getTile(x, y)
  {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height)
      return this.spriteMap.getSprite(this.voidTile);
    
    return this.spriteMap.getSprite(this.tiles[x + y * this.width] & 0xff);
  }
  
  collide(xPos, yPos, xBox, yBox)
  {
    const x0 = Math.floor(xPos - xBox);
    const x1 = Math.floor(xPos + xBox);
    const y0 = Math.floor(yPos - yBox);
    const y1 = Math.floor(yPos + yBox);
    
    return this.getTile(x0, y0).solid ||
    this.getTile(x1, y0).solid ||
    this.getTile(x0, y1).solid ||
    this.getTile(x1, y1).solid;
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

export function mapLoad(mapPath, onLoad)
{
  fileLoad("assets/map/" + mapPath + ".map", (mapFileText) => {
    const mapFile = JSON.parse(mapFileText);
    spriteMapLoad(mapFile.sprFile, (spriteMap) => {
      const map = new Map(spriteMap, mapFile.width, mapFile.height);
      
      for (let i = 0; i < mapFile.width * mapFile.height; i++)
        map.tiles[i] = mapFile.data[i];
      
      onLoad(map);
    });
  });
}
