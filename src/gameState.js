import { Vector2 } from "./util/math.js";
import { GUIButton, GUILabel } from "./GUI.js";

export class GameState {
  constructor(input, game, gui)
  {
    this.input = input;
    this.game = game;
    this.gui = gui;
  }
  
  load(loadState)
  {
    this.gui.isActive = false;
    this.input.startAction();
    
    this.input.bind("p", () => {
      this.gui.isActive = true;
      this.input.stopAction();
    });
    
    const btnContinue = new GUIButton(
      new GUILabel("continue", this.gui.font, new Vector2(2, 2)),
      new Vector2(10, 10),
      new Vector2(64, 9)
    );
    
    const btnQuit = new GUIButton(
      new GUILabel("quit", this.gui.font, new Vector2(2, 2)),
      new Vector2(10, btnContinue.offset.y + btnContinue.size.y + 1),
      new Vector2(64, 9)
    );
    
    btnContinue.addEventListener("onClick", () => {
      this.gui.isActive = false;
      this.input.startAction();
    });
    
    btnQuit.addEventListener("onClick", () => {
      loadState("menuState");
    });
    
    this.gui.addElement(btnContinue);
    this.gui.addElement(btnQuit);
    
    this.game.mapLoad("nexus");
    this.game.player.pos = new Vector2(3.0, 3.0);
  }
  
  unload()
  {
    this.gui.unload();
  }
  
  update(deltaTime)
  {
    this.game.update(deltaTime, this.input.getUserCommand());
  }
};
