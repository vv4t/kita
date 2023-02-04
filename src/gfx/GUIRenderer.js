import { clamp, Vector2 } from "../util/math.js";
import { GUIButtonState } from "../GUI.js";

const ALPHA_BEGIN = "a".charCodeAt(0);
const ALPHA_END = "z".charCodeAt(0);
const NUM_BEGIN = "0".charCodeAt(0);
const NUM_END = "9".charCodeAt(0);

export class GUIRenderer {
  constructor(bitmap, fontSpriteMap)
  {
    this.bitmap = bitmap;
    this.fontSpriteMap = fontSpriteMap;
  }
  
  renderGUI(gui)
  {
    this.drawRect(
      Math.floor(gui.mousePos.x) - 1,
      Math.floor(gui.mousePos.y) - 1,
      2, 2,
      [ 255, 255, 255, 255]);
    
    for (const button of gui.buttons)
      this.drawButton(button);
  }
  
  drawButton(button)
  {
    let color;
    switch (button.state) {
    case GUIButtonState.RELEASE:
      color = [ 255, 255, 255, 255 ];
      break;
    case GUIButtonState.HOVER:
      color = [ 255, 255, 255, 128 ];
      break;
    case GUIButtonState.HOLD:
      color = [ 100, 100, 100, 128 ];
      break;
    }
    
    this.drawRect(
      button.xOffset,
      button.yOffset,
      button.width,
      button.height,
      color);
    
    this.drawText(button.text, button.xOffset + 2, button.yOffset + 2, color);
  }
  
  drawRect(xStart, yStart, width, height, color)
  {
    const xEnd = xStart + width - 1;
    const yEnd = yStart + height - 1;
    
    for (let y = yStart; y <= yEnd; y++) {
      this.putRGBA(xStart, y, color[0], color[1], color[2], color[3]);
      this.putRGBA(xEnd, y, color[0], color[1], color[2], color[3]);
    }
    
    for (let x = xStart + 1; x < xEnd; x++) {
      this.putRGBA(x, yStart, color[0], color[1], color[2], color[3]);
      this.putRGBA(x, yEnd, color[0], color[1], color[2], color[3]);
    }
  }
  
  drawText(text, xOffset, yOffset, color)
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
      this.drawTextureShade(texChar, i * (texChar.width + 1) + xOffset, yOffset, color);
    }
  }
  
  drawTextureShade(texture, xOffset, yOffset, color)
  {
    for (let y = 0; y < texture.height; y++) {
      const yPixel = yOffset + y;
      
      for (let x = 0; x < texture.width; x++) {
        const xPixel = xOffset + x;
        
        const [ R, G, B, A ] = texture.getRGBA(x, y);
        this.putRGBAShade(xPixel, yPixel, R, G, B, A, color);
      }
    }
  }
  
  drawTexture(texture, xOffset, yOffset)
  {
    for (let y = 0; y < texture.height; y++) {
      const yPixel = yOffset + y;
      
      for (let x = 0; x < texture.width; x++) {
        const xPixel = xOffset + x;
        
        const [ R, G, B, A ] = texture.getRGBA(x, y);
        this.putRGBA(xPixel, yPixel, R, G, B, A);
      }
    }
  }
  
  putRGBAShade(x, y, R, G, B, A, color)
  {
    const colorR = clamp(R * color[0] / 255.0, 0, 255);
    const colorG = clamp(G * color[1] / 255.0, 0, 255);
    const colorB = clamp(B * color[2] / 255.0, 0, 255);
    const colorA = clamp(A * color[3] / 255.0, 0, 255);
    
    this.putRGBA(
      x, y,
      colorR,
      colorG,
      colorB,
      colorA);
  }
  
  putRGBA(x, y, R, G, B, A)
  {
    if (A == 0)
      return;
    
    if (A == 255) {
      this.bitmap.putRGB(x, y, R, G, B, A);
    } else {
      const [ bgR, bgG, bgB ] = this.bitmap.getRGB(x, y);
      
      const dR = R - bgR;
      const dG = G - bgG;
      const dB = B - bgB;
      
      const lerp = A / 255.0;
      
      const shadeR = Math.floor(bgR + dR * lerp);
      const shadeG = Math.floor(bgG + dG * lerp);
      const shadeB = Math.floor(bgB + dB * lerp);
      
      this.bitmap.putRGB(x, y, shadeR, shadeG, shadeB);
    }
  }
};
