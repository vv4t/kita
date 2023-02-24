import { rand } from "../util//math.js";
import { fileLoad } from "../util/file.js";
import { tileSetLoad } from "./tileSet.js";

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
  static FLIPPED_HORIZONTALLY_FLAG  = 0x80000000;
  static FLIPPED_VERTICALLY_FLAG    = 0x40000000;
  static FLIPPED_DIAGONALLY_FLAG    = 0x20000000;
  
  constructor(tileSet, sky, width, height, walls, props)
  {
    this.tileSet = tileSet;
    this.sky = sky;
    this.width = width;
    this.height = height;
    this.walls = walls;
    this.tiles = new Uint32Array(this.width * this.height);
    this.props = props;
    this.voidTile = 0;
  }
  
  getWalls()
  {
    return this.walls;
  }
  
  getProps()
  {
    return this.props;
  }
  
  getTile(x, y)
  {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height)
      return this.voidTile;
    
    return this.tiles[x + y * this.width];
  }
  
  isSolid(x, y)
  {
    return this.tileSet.getTile(this.getTile(x, y) & 255).solid;
  }
  
  collide(xPos, yPos, xBox, yBox)
  {
    const x0 = Math.floor(xPos - xBox);
    const x1 = Math.floor(xPos + xBox);
    const y0 = Math.floor(yPos - yBox);
    const y1 = Math.floor(yPos + yBox);
    
    return this.isSolid(x0, y0)||
    this.isSolid(x1, y0) ||
    this.isSolid(x0, y1) ||
    this.isSolid(x1, y1)
  }
  
  // Cast a ray from a position in a certain direction and return the first wall it hits
  // TODO: some sort of distance limiter
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
    while (!this.isSolid(xMap, yMap)) {
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
    tileSetLoad(mapFile.ts, (tileSet) => {
      const map = new Map(
        tileSet,
        mapFile.sky,
        mapFile.width,
        mapFile.height,
        mapFile.walls,
        mapFile.props);
      
      for (let i = 0; i < mapFile.width * mapFile.height; i++)
        map.tiles[i] = mapFile.data[i];
      
      onLoad(map);
    });
  });
}
