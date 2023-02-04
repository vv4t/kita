import { Vector2 } from "./util/math.js";

export class GUIButtonState {
  static RELEASE  = 0;
  static HOVER    = 1;
  static HOLD     = 2;
};

class GUIButton {
  constructor(text, xOffset, yOffset, width, height, onRelease)
  {
    this.text = text;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.width = width;
    this.height = height;
    this.onRelease = onRelease;
    this.state = GUIButtonState.RELEASE;
  }
};

export class GUI {
  constructor(bitmap, fontSpriteMap)
  {
    this.bitmap = bitmap;
    this.fontSpriteMap = fontSpriteMap;
    this.buttons = [];
    
    this.mousePos = new Vector2(0.0, 0.0);
    this.mouseSensitivity = 0.25;
  }
  
  update(deltaTime)
  {
    this.buttonHover();
  }
  
  addButton(text, xOffset, yOffset, onRelease)
  {
    this.buttons.push(new GUIButton(
      text,
      xOffset,
      yOffset,
      text.length * (this.fontSpriteMap.spriteWidth + 1) + 3,
      this.fontSpriteMap.spriteHeight + 4,
      onRelease));
  }
  
  keyEvent(key, action)
  {
    
  }
  
  mouseMove(xMovement, yMovement)
  {
    this.mouseUpdate(xMovement, yMovement);
  }
  
  mouseEvent(buttonID, action)
  {
    this.buttonClick(buttonID, action);
  }
  
  buttonClick(buttonID, action)
  {
    for (const button of this.buttons) {
      if (buttonID != 0)
        continue;
      
      if (button.state == GUIButtonState.HOVER && action)
        button.state = GUIButtonState.HOLD;
      else if (button.state == GUIButtonState.HOLD && !action) {
        button.state = GUIButtonState.HOVER;
        if (button.onRelease)
          button.onRelease();
      }
    }
  }
  
  buttonHover()
  {
    for (const button of this.buttons) {
      if (button.state == GUIButtonState.HOLD)
        continue;
      
      if (this.mousePos.x > button.xOffset
      && this.mousePos.x < button.xOffset + button.width
      && this.mousePos.y > button.xOffset
      && this.mousePos.y < button.yOffset + button.height) {
        button.state = GUIButtonState.HOVER;
      } else {
        button.state = GUIButtonState.RELEASE;
      }
    }
  }
  
  mouseUpdate(xMovement, yMovement)
  {
    const newPos = this.mousePos.copy().add(new Vector2(xMovement, yMovement).mulf(this.mouseSensitivity));
    
    if (newPos.x >= 1 && newPos.x <= this.bitmap.width - 1)
      this.mousePos.x = newPos.x;
    
    if (newPos.y >= 1 && newPos.y <= this.bitmap.height - 1)
      this.mousePos.y = newPos.y;
  }
};
