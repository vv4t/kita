import { BaseScene } from "./baseScene.js";
import { Vector2, Vector3 } from "../util/math.js";
import { Zombie } from "../game/entities/zombie.js";

export class SceneGame extends BaseScene {
  constructor(app)
  {
    super(app);
  }
  
  load()
  {
    this.app.gui.isActive = false;
    this.app.input.startAction();
    
    this.app.input.setBind("pause_menu", () => {
      this.app.gui.isActive = true;
      this.app.input.stopAction();
    });
    
    this.initGUI();
    
    this.app.game.mapLoad("nexus");
  }
  
  mapLoad()
  {
    this.app.game.player.pos = new Vector2(3.0, 3.0);
    this.app.game.entities.push(new Zombie(new Vector3(2.0, 4.0, 0.0)));
  }
  
  initGUI()
  {
    const btnContinue = this.app.gui.createButton(
      new Vector2(10, 10),
      new Vector2(64, 9)
    );
    
    btnContinue.addChild(this.app.gui.createLabel("continue", new Vector2(2, 2)));
    
    const btnQuit = this.app.gui.createButton (
      new Vector2(10, btnContinue.offset.y + btnContinue.size.y + 1),
      new Vector2(64, 9)
    );
    
    btnQuit.addChild(this.app.gui.createLabel("quit", new Vector2(2, 2)));
    
    btnContinue.addEventListener("onClick", () => {
      this.app.gui.isActive = false;
      this.app.input.startAction();
    });
    
    btnQuit.addEventListener("onClick", () => {
      this.app.sceneLoad("sceneMenu");
    });
    
    this.app.gui.addElement(btnContinue);
    this.app.gui.addElement(btnQuit);
  }
  
  unload()
  {
    
  }
  
  update(deltaTime)
  {
    this.app.game.update(deltaTime, this.app.input.getUserCommand());
  }
};
