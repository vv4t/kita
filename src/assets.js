import { spriteMapLoad } from "./gfx/spriteMap.js";

export async function assetsLoad(onLoaded)
{
  const assets = {
    "font": await new Promise((resolve) => {
      spriteMapLoad("font", (font) => resolve(font));
    })
  };
  
  onLoaded(assets);
}
