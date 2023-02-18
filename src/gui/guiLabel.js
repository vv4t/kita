import { GUIElement } from "./guiElement.js";
import { Vector2 } from "../util/math.js";

export class GUILabel extends GUIElement {
  constructor(text, fontSpriteMap, offset)
  {
    super(
      offset,
      new Vector2(
        text.length * (fontSpriteMap.spriteWidth + 1) + 3,
        fontSpriteMap.spriteHeight + 4
      )
    );
    
    this.fontSpriteMap = fontSpriteMap;
    this.text = text;
  }
};

