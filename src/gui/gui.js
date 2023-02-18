import { Vector2 } from "../util/math.js";
import { GUIButton } from "./guiButton.js";
import { GUILabel } from "./guiLabel.js";

export class GUI {
  constructor(bitmap, font)
  {
    this.bitmap = bitmap;
    this.font = font;
    
    this.mousePos = new Vector2(0.0, 0.0);
    this.mouseSensitivity = 0.25;
    this.isActive = false;
    
    this.elements = [];
  }
  
  unload()
  {
    this.elements = [];
  }
  
  createButton(offset, size)
  {
    return new GUIButton(offset, size);
  }
  
  createLabel(text, offset)
  {
    return new GUILabel(text, this.font, offset);
  }
  
  addElement(element)
  {
    this.elements.push(element);
  }
  
  keyEvent(key, action)
  {
    if (!this.isActive)
      return false;
    
    for (const element of this.elements)
      element.triggerEvent("keyEvent", (_self) => _self.isFocused, key, action);
  }
  
  mouseEvent(button, action)
  {
    if (!this.isActive)
      return;
    
    for (const element of this.elements) {
      element.isFocused = false;
      element.triggerEvent(
        "mouseEvent",
        (_self) => {
          return boxBoundPos(this.mousePos, _self.offset, _self.size);
        },
        button, action
      );
    }
  }
  
  mouseMove(xMovement, yMovement)
  {
    if (!this.isActive)
      return;
    
    for (const element of this.elements) {
      element.triggerEvent(
        "mouseMove",
        (_self) => {
          const inBound = boxBoundPos(this.mousePos, _self.offset, _self.size);
          
          if (!_self.inBound && inBound)
            element.triggerEvent("mouseEnter", null);
          else if (_self.inBound && !inBound)
            element.triggerEvent("mouseExit", null);
          
          _self.inBound = inBound;
          
          return inBound;
        },
        xMovement, yMovement
      );
    }
    
    const newPos = this.mousePos.copy().add(new Vector2(xMovement, yMovement).mulf(this.mouseSensitivity));
    
    if (newPos.x > 0 && newPos.x < this.bitmap.width)
      this.mousePos.x = newPos.x;
    
    if (newPos.y > 0 && newPos.y < this.bitmap.height)
      this.mousePos.y = newPos.y;
  }
  
  setActive(isActive)
  {
    this.isActive = isActive;
  }
};

function boxBoundPos(pos, boxPos, boxSize)
{
  return pos.x >= boxPos.x
  && pos.y >= boxPos.y
  && pos.x <= boxPos.x + boxSize.x
  && pos.y <= boxPos.y + boxSize.y;
}
