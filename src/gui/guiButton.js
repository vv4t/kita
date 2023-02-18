import { GUIElement } from "./guiElement.js";

export class GUIButtonState {
  static RELEASE = 0;
  static HOVER = 1;
  static HOLD = 2;
};

export class GUIButton extends GUIElement {
  constructor(offset, size)
  {
    super(offset, size);
    
    this.state = GUIButtonState.RELEASE;
    
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

