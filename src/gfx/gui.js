import { spriteMapLoad } from "./spriteMap.js";
import { Vector2 } from "../util/math.js";

const ALPHA_BEGIN = "a".charCodeAt(0);
const ALPHA_END = "z".charCodeAt(0);
const NUM_BEGIN = "0".charCodeAt(0);
const NUM_END = "9".charCodeAt(0);

const CHAR_PAD = 1;


export class GUI {
  constructor(bitmap)
  {
    this.bitmap = bitmap;
    this.fontSpriteMap = null;
    
    this.mousePos = new Vector2(0.0, 0.0);
    this.mouseSensitivity = 0.25;
    
    spriteMapLoad("font", (fontSpriteMap) => {
      this.fontSpriteMap = fontSpriteMap;
    });
  }
  
  renderGUI()
  {
    this.drawRect(
      Math.floor(this.mousePos.x) - 1,
      Math.floor(this.mousePos.y) - 1,
      2, 2);
    
    this.drawButton("ok epic", 10, 10);
  }
  
  keyEvent(key, action)
  {
    
  }
  
  mouseMove(xMovement, yMovement)
  {
    this.updateCursor(xMovement, yMovement);
  }
  
  mouseEvent(button, action)
  {
    
  }
  
  updateCursor(xMovement, yMovement)
  {
    const newPos = this.mousePos.copy().add(new Vector2(xMovement, yMovement).mulf(this.mouseSensitivity));
    
    if (newPos.x >= 1 && newPos.x <= this.bitmap.width - 1)
      this.mousePos.x = newPos.x;
    
    if (newPos.y >= 1 && newPos.y <= this.bitmap.height - 1)
      this.mousePos.y = newPos.y;
  }
  
  drawButton(text, xOffset, yOffset)
  {
    if (!this.fontSpriteMap)
      return;
    
    this.drawRect(
      xOffset, yOffset,
      text.length * (this.fontSpriteMap.spriteWidth + CHAR_PAD) + 3,
      this.fontSpriteMap.spriteHeight + 4);
    
    this.drawText(text, xOffset + 2, yOffset + 2);
  }
  
  drawRect(xStart, yStart, width, height)
  {
    const xEnd = xStart + width - 1;
    const yEnd = yStart + height - 1;
    
    for (let y = yStart; y <= yEnd; y++) {
      this.bitmap.putRGB(xStart, y, 255, 255, 255);
      this.bitmap.putRGB(xEnd, y, 255, 255, 255);
    }
    
    for (let x = xStart; x <= xEnd; x++) {
      this.bitmap.putRGB(x, yStart, 255, 255, 255);
      this.bitmap.putRGB(x, yEnd, 255, 255, 255);
    }
  }
  
  drawText(text, xOffset, yOffset)
  {
    if (!this.fontSpriteMap)
      return;
    
    const lowerText = text.toLowerCase();
    
    for (let i = 0; i < text.length; i++) {
      const charASCII = text.charCodeAt(i);
      
      let spriteID = 0;
      
      if (charASCII >= ALPHA_BEGIN && charASCII <= ALPHA_END)
        spriteID = charASCII - ALPHA_BEGIN;
      else if (charASCII >= NUM_BEGIN && charASCII <= NUM_END)
        spriteID = 25 + charASCII - NUM_BEGIN;
      else if (text[i] == ".")
        spriteID = 36;
      else if (text[i] == "?")
        spriteID = 37;
      else if (text[i] == "!")
        spriteID = 38;
      else if (text[i] == " ")
        continue;
      
      const texChar = this.fontSpriteMap.getSprite(spriteID).tex;
      this.drawTexture(texChar, i * (texChar.width + CHAR_PAD) + xOffset, yOffset);
    }
  }
  
  drawTexture(texture, xOffset, yOffset)
  {
    for (let y = 0; y < texture.height; y++) {
      const yPixel = yOffset + y;
      
      for (let x = 0; x < texture.width; x++) {
        const xPixel = xOffset + x;
        
        const [ R, G, B, A ] = texture.getRGBA(x, y);
        
        if (A == 0) {
          continue;
        } else if (A < 255) {
          const [ bgR, bgG, bgB ] = this.bitmap.getRGB(x, y);
          
          const dR = R - bgR;
          const dG = G - bgG;
          const dB = B - bgB;
          
          const lerp = A / 255.0;
          
          const shadeR = Math.floor(bgR + dR * lerp);
          const shadeG = Math.floor(bgG + dG * lerp);
          const shadeB = Math.floor(bgB + dB * lerp);
          
          this.bitmap.putRGB(xPixel, yPixel, shadeR, shadeG, shadeB);
        } else {
          this.bitmap.putRGB(xPixel, yPixel, R, G, B, A);
        }
      }
    }
  }
};
