import { Game } from "./game/game.js";
import { Input } from "./input.js";
import { GUI, GUIButton, GUILabel } from "./GUI.js";
import { GUIRenderer } from "./gfx/GUIRenderer.js";
import { Bitmap } from "./gfx/bitmap.js";
import { Renderer } from "./gfx/renderer.js";
import { Cmd } from "./util/cmd.js";
import { Screen } from "./screen.js";
import { spriteMapLoad } from "./gfx/spriteMap.js";
import { Vector2 } from "./util/math.js";

function run(fontSpriteMap)
{
  const screen = new Screen(document.getElementById("canvas"));
  const bitmap = new Bitmap(256, 144);
  const renderer = new Renderer(bitmap);
  const gui = new GUI(bitmap);
  const guiRenderer = new GUIRenderer(bitmap, fontSpriteMap);
  const input = new Input();
  const game = new Game();
  
  input.bindAction("w", "forward");
  input.bindAction("a", "left");
  input.bindAction("s", "back");
  input.bindAction("d", "right");
  
  input.bind("p", () => {
    gui.isActive = true;
    input.stopAction();
  });
  
  const lblKita = new GUILabel("KITA", fontSpriteMap, new Vector2(10, 10));
  
  const btnContinue = new GUIButton(
    new GUILabel("continue", fontSpriteMap, new Vector2(2, 2)),
    new Vector2(10, lblKita.offset.y + lblKita.size.y + 1),
    new Vector2(64, 9)
  );
  
  const btnQuit = new GUIButton(
    new GUILabel("quit", fontSpriteMap, new Vector2(2, 2)),
    new Vector2(10, btnContinue.offset.y + btnContinue.size.y + 1),
    new Vector2(64, 9)
  );
  
  btnContinue.addEventListener("onClick", () => {
    gui.isActive = false;
    input.startAction();
  });
  
  gui.addElement(lblKita);
  gui.addElement(continueButton);
  gui.addElement(quitButton);
  
  screen.addEventListener("keyEvent", (key, action) => {
    gui.keyEvent(key, action);
    input.keyEvent(key, action);
  });
  
  screen.addEventListener("mouseMove", (xMovement, yMovement) => {
    gui.mouseMove(xMovement, yMovement);
    input.mouseMove(xMovement, yMovement);
  });
  
  screen.addEventListener("mouseEvent", (button, action) => {
    gui.mouseEvent(button, action);
    input.mouseEvent(button, action);
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
    
    game.update(deltaTime, input.getUserCommand());
    
    renderer.render(game);
    guiRenderer.render(gui);
    
    bitmap.swap();
    screen.swap(bitmap);
    
    window.requestAnimationFrame(animate);
  }
  
  window.requestAnimationFrame(animate);
};

spriteMapLoad("font", (fontSpriteMap) => {
  run(fontSpriteMap);
});
