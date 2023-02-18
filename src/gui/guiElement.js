export class GUIElement {
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

