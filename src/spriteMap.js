import { fileLoad } from "./file.js";
import { Texture, textureLoad } from "./texture.js";

export class SprConfig {
  constructor(solid, tex)
  {
    this.solid = solid;
    this.tex = tex;
  }
};

class SpriteMap {
  constructor(spriteArr)
  {
    this.spriteArr = spriteArr;
  }
  
  getSprite(id)
  {
    return this.spriteArr[id];
  }
};

export function spriteMapLoad(sprPath, onLoad)
{
  fileLoad("assets/spr/" + sprPath + ".spr", (sprFileText) => {
    const sprFile = JSON.parse(sprFileText);
    const sprTexPath = "assets/spr/" + sprFile.src + ".png";
    
    textureLoad(sprTexPath, (sprTex) => {
      const sprArr = [];
      
      const numRow = Math.floor(sprFile.sprCount / sprFile.columns);
      
      for (let i = 0; i < numRow; i++) {
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
          
          const tID = i * sprFile.columns + j;
          const sprConfig = sprFile.sprConfig[tID];
          
          let solid = false;
          
          if (sprConfig) {
            solid = sprConfig.solid;
          }
          
          sprArr.push(new SprConfig(solid, tex));
        }
      }
      
      onLoad(new SpriteMap(sprArr));
    });
  });
}
