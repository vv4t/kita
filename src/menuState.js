import { Vector2 } from "./util/math.js";
import { UserCommand } from "./game/userCommand.js";
import { GUIButton, GUILabel } from "./GUI.js";

export class MenuState {
  constructor(input, game, gui)
  {
    this.input = input;
    this.game = game;
    this.gui = gui;
    this.time = 0.0;
  }
  
  load(loadState)
  {
    this.input.stopAction();
    this.gui.isActive = true;
    
    const lblKita = new GUILabel("KITA", this.gui.font, new Vector2(10, 10));
    
    const btnContinue = new GUIButton(
      new GUILabel("play", this.gui.font, new Vector2(2, 2)),
      new Vector2(10, lblKita.offset.y + lblKita.size.y + 1),
      new Vector2(64, 9)
    );
    
    const btnHi = new GUIButton(
      new GUILabel("say hi", this.gui.font, new Vector2(2, 2)),
      new Vector2(10, btnContinue.offset.y + btnContinue.size.y + 1),
      new Vector2(64, 9)
    );
    
    const btnQuit = new GUIButton(
      new GUILabel("quit", this.gui.font, new Vector2(2, 2)),
      new Vector2(10, btnHi.offset.y + btnHi.size.y + 1),
      new Vector2(64, 9)
    );
    
    btnContinue.addEventListener("onClick", () => {
      loadState("gameState");
    });
    
    btnHi.addEventListener("onClick", () => {
      alert("HI");
    });
    
    this.gui.addElement(lblKita);
    this.gui.addElement(btnContinue);
    this.gui.addElement(btnHi);
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
    this.time += deltaTime;
    this.game.update(deltaTime, new UserCommand(0.0, 0.0, Math.cos(this.time)));
  }
};
