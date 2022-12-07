import { Bitmap } from "./bitmap.js";
import { rand, clamp, degToRad, Vector2 } from "./math.js";
import { Map } from "./map.js";
import { Renderer } from "./renderer.js";

const canvas = document.getElementById("canvas");

const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const bitmap = new Bitmap(256, 144);
const renderer = new Renderer(bitmap);

const map = new Map();

let playerPos = new Vector2(5, 5);
let playerDir = 0;

let moveForward = false, moveBack = false;
let lookLeft = false, lookRight = false;

document.addEventListener("keydown", function(e) {
  keyEvent(e.key, true);
});

document.addEventListener("keyup", function(e) {
  keyEvent(e.key, false);
});

function keyEvent(key, action)
{
  switch (key) {
  case "w":
    moveForward = action;
    break;
  case "s":
    moveBack = action;
    break;
  case "a":
    lookLeft = action;
    break;
  case "d":
    lookRight = action;
    break;
  }
}

function animate()
{
  let moveDir = new Vector2(0, 0);
  
  if (moveForward)
    moveDir.y += 0.035;
  if (moveBack)
    moveDir.y -= 0.035;
  
  if (lookLeft)
    playerDir += 0.035;
  if (lookRight)
    playerDir -= 0.035;
  
  playerPos.add(moveDir.rotate(playerDir));
  
  renderer.renderMap(map, playerPos, playerDir);
  renderer.renderSprite(new Vector2(5, 9), playerPos, playerDir);
  bitmap.swap();
  ctx.drawImage(bitmap.canvas, 0, 0, canvas.width, canvas.height);
  
  window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);
