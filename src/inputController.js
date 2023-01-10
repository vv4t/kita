import { UserCommand } from "./game/userCommand.js";

export class InputController {
  constructor(canvas)
  {
    this.lookSensitivity = 0.005;
    
    this.moveForward = 0.0;
    this.moveLeft = 0.0;
    this.moveBack = 0.0;
    this.moveRight = 0.0;
    this.mouseX = 0.0;
  }
  
  mouseMove(xMovement, yMovement)
  {
    this.mouseX += xMovement; 
  }
  
  mouseEvent(button, action)
  {
    
  }
  
  keyEvent(key, action)
  {
    switch (key) {
    case "w":
      this.moveForward = action;
      break;
    case "a":
      this.moveLeft = action;
      break;
    case "s":
      this.moveBack = action;
      break;
    case "d":
      this.moveRight = action;
      break;
    }
  }
  
  getUserCommand()
  {
    return new UserCommand(
      this.moveRight - this.moveLeft,
      this.moveForward - this.moveBack,
      -this.mouseX * this.lookSensitivity
    );
  }
};
