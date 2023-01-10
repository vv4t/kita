import { Game } from "./game/game.js";
import { InputController } from "./inputController.js";
import { GUI } from "./gfx/gui.js";
import { Bitmap } from "./gfx/bitmap.js";
import { Renderer } from "./gfx/renderer.js";
import { Cmd } from "./util/cmd.js";
import { Screen } from "./screen.js";

(function() {
  const screen = new Screen(document.getElementById("canvas"));
  const bitmap = new Bitmap(256, 144);
  const renderer = new Renderer(bitmap);
  const gui = new GUI(bitmap);
  const inputController = new InputController(canvas);
  
  const game = new Game();
  
  // i should probably make classes with the event listeners inherit a base class with such functions
  // but i like this better oops
  // maybe the base class would be better but ill do that later
  screen.addEventListener("keyEvent", (key, action) => {
    inputController.keyEvent(key, action);
  });
  
  screen.addEventListener("mouseMove", (xMovement, yMovement) => {
    inputController.mouseMove(xMovement, yMovement);
  });
  
  screen.addEventListener("mouseEvent", (button, action) => {
    inputController.mouseEvent(button, action);
  });
  
  game.addEventListener("mapLoad", (map) => {
    renderer.mapLoad(map);
  });
  
  // game.mapLoad("nexus");
  
  let prevTime = performance.now();

  function animate() {
    const nowTime = performance.now();
    const deltaTime = (nowTime - prevTime) * 0.001;
    prevTime = nowTime;
    
    // game.update(deltaTime, inputController.getUserCommand());
    // renderer.renderGame(game);
    bitmap.swap();
    screen.swap(bitmap);
    
    window.requestAnimationFrame(animate);
  }
  
  window.requestAnimationFrame(animate);
})();
