import { fileLoad } from "./file.js";
import { Texture, textureLoad } from "./texture.js";

class SprConfig {
  constructor(solid)
  {
    this.solid == solid;
  }
};

export class Tile {
  constructor(solid, tex)
  {
    this.solid = solid;
    this.tex = tex;
  }
};

class SpriteMap {
  constructor(sprArr)
  {
    this.sprArr = sprArr;
  }
  
  getTile(id)
  {
    return this.sprArr[id];
  }
};

export function spriteMapLoad(sprPath, onLoad)
{
  fileLoad(sprPath, (sprFileText) => {
    const sprFile = JSON.parse(sprFileText);
    const sprTexPath = "assets/spr/" + sprFile.src + ".png";
    
    textureLoad(sprTexPath, (sprTex) => {
      const sprArr = [];
      
      for (let i = 0; i < sprFile.sprCount; i += sprFile.columns) {
        for (let j = 0; j < sprFile.columns; j++) {
          const tex = new Texture(sprFile.sprWidth, sprFile.sprHeight);
          
          const xPixel0 = j * sprFile.sprWidth;
          const xPixel1 = (j + 1) * sprFile.sprWidth;
          
          const yPixel0 = i * sprFile.sprHeight;
          const yPixel1 = (i + 1) * sprFile.sprHeight;
          
          let pixID = 0;
          
          for (let yp = yPixel0; yp < yPixel1; yp++) {
            for (let xp = xPixel0; xp < xPixel1; xp++) {
              const [ R, G, B, A ] = sprTex.getRGBA(xp, yp);
              tex.dataU8[pixID + 0] = R;
              tex.dataU8[pixID + 1] = G;
              tex.dataU8[pixID + 2] = B;
              tex.dataU8[pixID + 3] = A;
              pixID += 4;
            }
          }
          
          const tID = i + j;
          const sprConfig = sprFile.sprConfig[tID];
          
          let solid = false;
          
          if (sprConfig) {
            solid = sprConfig.solid;
          }
          
          sprArr.push(new Tile(solid, tex));
        }
      }
      
      onLoad(new SpriteMap(sprArr));
    });
  });
}
