import { fileLoad } from "./file.js";
import { textureLoad } from "./texture.js";

class SpriteMap {
  constructor(sprArr)
  {
    this.sprArr = sprArr;
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
          const spr = new Texture(sprFile.sprWidth, sprFile.sprHeight);
          
          const xPixel0 = j * sprFile.sprWidth;
          const xPixel1 = (j + 1) * sprFile.sprWidth;
          
          const yPixel0 = i * sprFile.sprHeight;
          const yPixel1 = (i + 1) * sprFile.sprHeight;
          
          let i = 0;
          
          for (let yp = yPixel0; yp < yPixel1; yp++) {
            for (let xp = xPixel0; xp < xPixel1; xp++) {
              const [ R, G, B, A ] = sprText.getRGB(xp, yp);
              texture.dataU8[i + 0] = R;
              texture.dataU8[i + 1] = G;
              texture.dataU8[i + 2] = B;
              texture.dataU8[i + 3] = A;
              i += 4;
            }
          }
          
          sprArr.push(spr);
        }
      }
      
      
    });
  });
}
