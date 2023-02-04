import { Game } from "./game/game.js";
import { InputController } from "./inputController.js";
import { GUI } from "./GUI.js";
import { GUIRenderer } from "./gfx/GUIRenderer.js";
import { Bitmap } from "./gfx/bitmap.js";
import { Renderer } from "./gfx/renderer.js";
import { Cmd } from "./util/cmd.js";
import { Screen } from "./screen.js";
import { spriteMapLoad } from "./gfx/spriteMap.js";

function run(fontSpriteMap)
{
  const screen = new Screen(document.getElementById("canvas"));
  const bitmap = new Bitmap(256, 144);
  const renderer = new Renderer(bitmap);
  const gui = new GUI(bitmap, fontSpriteMap);
  const guiRenderer = new GUIRenderer(bitmap, fontSpriteMap);
  const inputController = new InputController(canvas);
  const game = new Game();
  
  gui.addButton("test", 20, 20, null);
  
  screen.addEventListener("keyEvent", (key, action) => {
    gui.keyEvent(key, action);
    inputController.keyEvent(key, action);
  });
  
  screen.addEventListener("mouseMove", (xMovement, yMovement) => {
    gui.mouseMove(xMovement, yMovement);
    inputController.mouseMove(xMovement, yMovement);
  });
  
  screen.addEventListener("mouseEvent", (button, action) => {
    gui.mouseEvent(button, action);
    inputController.mouseEvent(button, action);
  });
  
  game.addEventListener("mapLoad", (map) => {
    renderer.mapLoad(map);
  });
  
  game.mapLoad("nexus");
  
  let prevTime = performance.now();

  function animate() {
    const nowTime = performance.now();
    const deltaTime = (nowTime - prevTime) * 0.001;
    prevTime = nowTime;
    
    game.update(deltaTime, inputController.getUserCommand());
    gui.update(deltaTime);
    
    renderer.renderGame(game);
    guiRenderer.renderGUI(gui);
    
    bitmap.swap();
    screen.swap(bitmap);
    
    window.requestAnimationFrame(animate);
  }
  
  window.requestAnimationFrame(animate);
};

spriteMapLoad("font", (fontSpriteMap) => {
  run(fontSpriteMap);
});
