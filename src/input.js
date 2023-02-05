import { UserCommand } from "./game/userCommand.js";

class Bind {
  constructor(name)
  {
    this.name = name;
    this.active = false;
  }
};

export class Input {
  constructor()
  {
    this.lookSensitivity = 0.005;
    
    this.mouseX = 0.0;
    
    this.actionActive = true;
    this.actionBinds = {};
    this.actionStates = {};
    
    this.bindKeys = {};
    this.bindFuncs = {};
  }
  
  startAction()
  {
    this.actionActive = true;
  }
  
  stopAction()
  {
    for (let [key, value] of Object.entries(this.actionStates))
      this.actionStates[key] = 0.0;
    
    this.actionActive = false;
  }
  
  bindAction(key, action)
  {
    this.actionBinds[key] = action;
    this.actionStates[action] = 0.0;
  }
  
  bind(key, name)
  {
    if (!this.bindKeys[key])
      this.bindKeys[key] = new Bind(name);
  }
  
  setBind(name, func)
  {
    this.bindFuncs[name] = func;
  }
  
  clearBind(name)
  {
    delete this.bindFuncs[name];
  }
  
  mouseMove(xMovement, yMovement)
  {
    if (this.actionActive)
      this.mouseX += xMovement; 
  }
  
  mouseEvent(button, action)
  {
    
  }
  
  keyEvent(key, action)
  {
    if (this.bindKeys[key]) {
      if (action) {
        if (!this.bindKeys[key].active) {
          this.bindFuncs[this.bindKeys[key].name]();
          this.bindKeys[key].active = false;
        }
      } else {
        this.bindKeys[key].active = false;
      }
    }
    
    if (this.actionActive) {
      if (this.actionBinds[key] != undefined)
        this.actionStates[this.actionBinds[key]] = action;
    }
  }
  
  getUserCommand()
  {
    return new UserCommand(
      this.actionStates["right"] - this.actionStates["left"],
      this.actionStates["forward"] - this.actionStates["back"],
      -this.mouseX * this.lookSensitivity
    );
  }
};
