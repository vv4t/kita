import { Vector2 } from "../util/math.js";
import { UserCommand } from "../game/userCommand.js";

export class SceneMenu {
  constructor(app)
  {
    this.app = app;
    this.time = 0.0;
  }
  
  load()
  {
    this.app.input.stopAction();
    this.app.gui.isActive = true;
    
    this.initGUI();
    
    this.app.game.mapLoad("nexus");
  }
  
  mapLoad()
  {
    this.app.game.player.pos = new Vector2(3.0, 3.0);
  }
  
  initGUI()
  {
    const lblKita = this.app.gui.createLabel("KITA", new Vector2(10, 10));
    
    const btnPlay = this.app.gui.createButton(
      new Vector2(10, lblKita.offset.y + lblKita.size.y + 1),
      new Vector2(64, 9)
    );
    
    btnPlay.addChild(this.app.gui.createLabel("play", new Vector2(2, 2)));
    
    btnPlay.addEventListener("onClick", () => {
      this.app.sceneLoad("sceneGame");
    });
    
    this.app.gui.addElement(lblKita);
    this.app.gui.addElement(btnPlay);
  }
  
  unload()
  {
    
  }
  
  update(deltaTime)
  {
    this.time += deltaTime;
    this.app.game.update(deltaTime, new UserCommand(0.0, 0.0, Math.cos(this.time)));
  }
};
