import { Game } from "./game/game.js";
import { Input } from "./input.js";
import { GUI } from "./GUI.js";
import { GUIRenderer } from "./gfx/GUIRenderer.js";
import { Bitmap } from "./gfx/bitmap.js";
import { Renderer } from "./gfx/renderer.js";
import { Cmd } from "./util/cmd.js";
import { Screen } from "./screen.js";
import { spriteMapLoad } from "./gfx/spriteMap.js";
import { Vector2 } from "./util/math.js";
import { GameState } from "./gameState.js";
import { MenuState } from "./menuState.js";

function run(font)
{
  const screen = new Screen(document.getElementById("canvas"));
  const bitmap = new Bitmap(256, 144);
  const renderer = new Renderer(bitmap);
  const gui = new GUI(bitmap, font);
  const guiRenderer = new GUIRenderer(bitmap, font);
  const input = new Input();
  const game = new Game();
  
  input.bindAction("w", "forward");
  input.bindAction("a", "left");
  input.bindAction("s", "back");
  input.bindAction("d", "right");
  
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
  
  const appStates = {
    "gameState": new GameState(input, game, gui),
    "menuState": new MenuState(input, game, gui)
  };
  
  let nowState = null;
  
  function loadState(stateName)
  {
    if (nowState)
      appStates[nowState].unload();
    nowState = stateName;
    appStates[nowState].load(loadState);
  }
  
  loadState("menuState");
  
  let prevTime = performance.now();

  function animate() {
    const nowTime = performance.now();
    const deltaTime = (nowTime - prevTime) * 0.001;
    prevTime = nowTime;
    
    appStates[nowState].update(deltaTime);
    
    renderer.render(game);
    guiRenderer.render(gui);
    
    bitmap.swap();
    screen.swap(bitmap);
    
    window.requestAnimationFrame(animate);
  }
  
  window.requestAnimationFrame(animate);
};

spriteMapLoad("font", (font) => {
  run(font);
});
