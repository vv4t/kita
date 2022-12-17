import { UserCommand } from "./game/userCommand.js";

export class InputController {
  constructor(canvas)
  {
    const keyDown = (e) => {
      this.keyEvent(e.key, 1.0);
    };
    
    const keyUp = (e) => {
      this.keyEvent(e.key, 0.0);
    };
    
    const mouseMove = (e) => {
      this.mouseMove(e.movementX, e.movementY);
    };
    
    document.addEventListener("pointerlockchange", (e) => {
      if (document.pointerLockElement == canvas
      || document.mozPointerLockElement == canvas) {
        document.addEventListener("mousemove", mouseMove);
        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);
      } else {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("keydown", keyDown);
        document.removeEventListener("keyup", keyUp);
      }
    });
    
    canvas.addEventListener("click", function() {
      canvas.requestPointerLock();
    });
    
    this.lookSensitivity = 0.005;
    
    this.moveForward = 0.0;
    this.moveLeft = 0.0;
    this.moveBack = 0.0;
    this.moveRight = 0.0;
    this.mouseX = 0.0;
  }
  
  mouseMove(movementX, movementY)
  {
    this.mouseX += movementX; 
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
