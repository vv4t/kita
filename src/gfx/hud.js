import { Renderer2D } from "./renderer2D.js";

export class HUD extends Renderer2D {
  constructor(bitmap, hudSpriteMap, font)
  {
    super(bitmap);
    this.font = font;
    this.hudSpriteMap = hudSpriteMap;
    this.isVisible = false;
    
    this.oldRot = 0.0;
  }
  
  render(game)
  {
    if (!this.isVisible)
      return;
    
    this.drawCrossHair();
    this.drawWeapon();
    this.drawHealth();
    this.drawInfo();
  }
  
  drawInfo()
  {
    this.drawText(
      "X " + Math.floor(game.player.pos.x).toString() +
      "  Y " + Math.floor(game.player.pos.y).toString(),
      this.font,
      10, 10,
      [ 255, 255, 255, 255 ]
    );
  }
  
  drawHealth()
  {
    this.drawText("HP 100", this.font, 10, this.bitmap.height - 12, [ 255, 255, 255, 255 ]);
  }
  
  drawWeapon()
  {
    this.oldRot += (game.player.rot - this.oldRot) * 0.1;
    
    const cosMoveInterp = Math.cos(game.player.moveInterp * 5);
    const weapBob = cosMoveInterp * cosMoveInterp * 9;
    
    this.drawTexture(
      this.hudSpriteMap.getSprite(0),
      150 + Math.floor((game.player.rot - this.oldRot) * 10),
      this.bitmap.height - 4 * this.hudSpriteMap.spriteHeight + Math.floor(weapBob),
      4
    );
  }
  
  drawCrossHair()
  {
    this.drawTexture(
      this.hudSpriteMap.getSprite(1),
      (this.bitmap.width - this.hudSpriteMap.spriteWidth) / 2,
      (this.bitmap.height - this.hudSpriteMap.spriteHeight) / 2
    );
  }
};
