import { fileLoad } from "../util/file.js";
import { spriteMapLoad } from "../gfx/spriteMap.js";

export class TileConfig {
  constructor(solid)
  {
    this.solid = solid;
  }
};

export class TileSet {
  constructor(spriteMap, tileConfig)
  {
    this.spriteMap = spriteMap;
    this.tileConfig = tileConfig;
    this.defaultConfig = new TileConfig(false);
  }
  
  getTile(tileID)
  {
    if (!this.tileConfig[tileID])
      return this.defaultConfig;
    return this.tileConfig[tileID];
  }
};

export function tileSetLoad(tsPath, onLoad)
{
  fileLoad("assets/ts/" + tsPath + ".ts", (tsFileText) => {
    const tsFile = JSON.parse(tsFileText);
    
    spriteMapLoad(tsFile.spr, (spriteMap) => {
      const tileConfig = {};
      
      for (const tsConfig of tsFile.tsConfig)
        tileConfig[tsConfig.id] = new TileConfig(tsConfig.solid);
      
      onLoad(new TileSet(spriteMap, tileConfig));
    });
  });
}
