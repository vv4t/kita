import { Renderer } from "./gfx/renderer.js";
import { Bitmap } from "./gfx/bitmap.js";
import { Game } from "./game/game.js";
import { InputController } from "./inputController.js";

(function() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  
  const bitmap = new Bitmap(256, 144);
  const renderer = new Renderer(bitmap);
  const inputController = new InputController(canvas);
  
  const game = new Game();
  
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
    renderer.renderGame(game);
    bitmap.swap();
    ctx.drawImage(bitmap.canvas, 0, 0, canvas.width, canvas.height);
    
    window.requestAnimationFrame(animate);
  }
  window.requestAnimationFrame(animate);
})();
