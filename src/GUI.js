import { Vector2 } from "./util/math.js";

class GUIElement {
  constructor(offset, size)
  {
    this.offset = offset;
    this.size = size;
    
    this.children = [];
    this.events = {};
    
    this.events["keyEvent"] = [];
    this.events["mouseEvent"] = [];
    this.events["mouseMove"] = [];
    this.events["mouseEnter"] = [];
    
    this.isFocused = false;
    this.isVisible = false;
    this.inBound = false;
    
    this.addEventListener("mouseEvent", () => {
      this.isFocused = true;
      
      for (const child of this.children)
        child.isFocused = false;
    });
  }
  
  triggerEvent(eventName, triggerCondition, ...eventArgs)
  {
    if (triggerCondition) {
      if (!triggerCondition(this))
        return;
    }
    
    if (this.events[eventName]) {
      for (const eventAction of this.events[eventName])
        eventAction(...eventArgs);
    }
    
    for (const child of this.children) {
      if (child.isVisible)
        child.triggerEvent(eventName, triggerCondition, ...eventArgs);
    }
  }
  
  addChild(child)
  {
    this.children.push(child);
  }
  
  addEventListener(eventName, action)
  {
    if (!this.events[eventName])
      this.events[eventName] = [];
    
    this.events[eventName].push(action);
  }
};

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

export class GUIButtonState {
  static RELEASE = 0;
  static HOVER = 1;
  static HOLD = 2;
};

export class GUIButton extends GUIElement {
  constructor(base, offset, size)
  {
    super(offset, size);
    
    this.state = GUIButtonState.RELEASE;
    
    this.addChild(base);
    
    this.addEventListener("mouseEnter", () => {
      this.state = GUIButtonState.HOVER;
    });
    
    this.addEventListener("mouseExit", () => {
      this.state = GUIButtonState.RELEASE;
    });
    
    this.addEventListener("mouseEvent", (button, action) => {
      if (action) {
        this.state = GUIButtonState.HOLD;
      } else {
        this.state = GUIButtonState.HOVER;
        this.triggerEvent("onClick", null, button);
      }
    });
  }
};

export class GUI {
  constructor(bitmap)
  {
    this.bitmap = bitmap;
    
    this.mousePos = new Vector2(0.0, 0.0);
    this.mouseSensitivity = 0.25;
    this.isActive = false;
    
    this.elements = [];
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
