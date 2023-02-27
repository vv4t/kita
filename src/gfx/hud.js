import { Renderer2D } from "./renderer2D.js";

export class HUD extends Renderer2D {
  constructor(bitmap, hudSpriteMap, font)
  {
    super(bitmap);
    this.font = font;
    this.hudSpriteMap = hudSpriteMap;
    this.isVisible = false;
  }
  
  render(game)
  {
    if (!this.isVisible)
      return;
    
    this.drawTexture(
      this.hudSpriteMap.getSprite(1),
      this.bitmap.width / 2 - 8,
      this.bitmap.height / 2 - 8
    );
    
    this.drawText(
      "X " + Math.floor(game.player.pos.x).toString() +
      "  Y " + Math.floor(game.player.pos.y).toString(),
      this.font,
      10, 10,
      [ 255, 255, 255, 255 ]
    );
    
    this.drawText("HP 100", this.font, 10, this.bitmap.height - 12, [ 255, 255, 255, 255 ]);
  }
};
