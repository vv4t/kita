import { clamp, Vector2 } from "./math.js";
import { textureLoad } from "./texture.js";

const FOG_COLOR = [ 0, 0, 0 ];

let skyTex;

textureLoad("assets/sky/bocchi.png", (tex) => {
  skyTex = tex;
});

export class Renderer {
  constructor(bitmap)
  {
    this.bitmap = bitmap;
    this.halfWidth = this.bitmap.width / 2.0;
    this.halfHeight = this.bitmap.height / 2.0;
    this.zBuffer = new Float32Array(this.bitmap.width);
  }
  
  renderSprite(spriteTex, spritePos, camPos, camDir)
  {
    const cosDir = Math.cos(-camDir);
    const sinDir = Math.sin(-camDir);
    
    const xCam = spritePos.x - camPos.x;
    const yCam = spritePos.y - camPos.y;
    
    const xRot = xCam * cosDir - yCam * sinDir;
    const yRot = xCam * sinDir + yCam * cosDir;
    
    const xScreen = xRot / yRot * this.bitmap.width + this.halfWidth;
    const spriteSize = this.bitmap.width / yRot;
    
    const texStep = 1.0 / spriteSize;
    
    let xPixel0 = xScreen - 0.5 * spriteSize;
    let xPixel1 = xScreen + 0.5 * spriteSize;
    let yPixel0 = this.halfHeight - 0.5 * spriteSize;
    let yPixel1 = this.halfHeight + 0.5 * spriteSize;
    
    let xTex = 0;
    if (xPixel0 < 0) {
      xTex = -xPixel0 / spriteSize;
      xPixel0 = 0;
    }
    
    if (xPixel1 >= this.bitmap.width)
      xPixel1 = this.bitmap.width;
    
    let yTexStart = 0;
    if (yPixel0 < 0) {
      yTexStart = -yPixel0 / spriteSize;
      yPixel0 = 0;
    }
    
    if (yPixel1 >= this.bitmap.height)
      yPixel1 = this.bitmap.height;
    
    const xp0 = Math.floor(xPixel0);
    const xp1 = Math.floor(xPixel1);
    
    const yp0 = Math.floor(yPixel0);
    const yp1 = Math.floor(yPixel1);
    
    for (let x = xp0; x < xp1; x++) {
      xTex += texStep;
      
      if (this.zBuffer[x] < yRot)
        continue;
      
      this.zBuffer[x] = yRot;
      
      let yTex = yTexStart;
      for (let y = yp0; y < yp1; y++) {
        yTex += texStep;
        
        const xt = Math.floor(xTex * spriteTex.width);
        const yt = Math.floor(yTex * spriteTex.height);
        
        const [ R, G, B, A ] = spriteTex.getRGBA(xt, yt);
        
        this.putRGBAShade(x, y, yRot, R, G, B, A);
      }
    }
  }
  
  renderMap(map, pos, dir)
  {
    const cosDir = Math.cos(dir);
    const sinDir = Math.sin(dir);
    
    for (let x = 0; x < this.bitmap.width; x++) {
      const xCam = (x - this.halfWidth) / this.bitmap.width;
      
      // near_plane: Vector3(0, 1)
      //   Vector2(0, 1).rotate(dir) + Vector2(xCam, 0).rotate(dir)
      // = Vector2(xCam, 1).rotate(dir)
      const xRayDir = xCam * cosDir - sinDir;
      const yRayDir = xCam * sinDir + cosDir;
      
      const rayHit = map.rayCast(pos, new Vector2(xRayDir, yRayDir));
      const texWall = map.getTile(rayHit.xMap, rayHit.yMap).tex;

      let wallDist, xWall;
      if (rayHit.side) {
        wallDist = rayHit.xDist;
        xWall = Math.abs(pos.y + wallDist * yRayDir - rayHit.yMap);
      } else {
        wallDist = rayHit.yDist;
        xWall = Math.abs(pos.x + wallDist * xRayDir - rayHit.xMap);
      }
      
      this.zBuffer[x] = wallDist;
      
      const wallHeight = 0.5 / wallDist * this.bitmap.width;
      
      const yPixel0 = Math.floor(this.halfHeight - wallHeight);
      const yPixel1 = Math.ceil(this.halfHeight + wallHeight);
      
      let yWall = 0;
      if (yPixel0 < 0)
        yWall = -yPixel0 / (wallHeight * 2.0);
      
      const yWallStep = 0.5 / wallHeight;
      
      for (let y = 0; y < this.bitmap.height; y++) {
        if (y <= yPixel0) {
          let xTex = Math.floor(x - dir * this.bitmap.width);
          
          if (xTex < 0)
            xTex = skyTex.width - xTex;
          if (xTex >= skyTex.width)
            xTex = xTex % skyTex.width;
          
          const [ R, G, B, A ] = skyTex.getRGBA(xTex, y);
          
          const yCam = (y - this.halfHeight) / this.bitmap.width;
          const zDepth = Math.abs(0.5 / yCam);
          
          this.putRGBAShade(x, y, zDepth, R, G, B, 255);
        } else if (y > yPixel0 && y < yPixel1) {
          yWall += yWallStep;
          
          const xTex = Math.floor(xWall * texWall.width);
          const yTex = Math.floor(yWall * texWall.height);
          
          const [ R, G, B, A ] = texWall.getRGBA(xTex, yTex);
          
          this.putRGBShade(x, y, wallDist, R, G, B);
        } else {
          const yCam = (y - this.halfHeight) / this.bitmap.width;
          const zDepth = Math.abs(0.5 / yCam);
          
          const xDepth = xCam * zDepth;
          
          const xPixel = xDepth * cosDir - zDepth * sinDir + pos.x;
          const yPixel = xDepth * sinDir + zDepth * cosDir + pos.y;
          
          const xTile = Math.floor(xPixel);
          const yTile = Math.floor(yPixel);
          
          const texFloor = map.getTile(xTile, yTile).tex;
          
          const xTex = Math.floor((xPixel - Math.floor(xPixel)) * texFloor.width);
          const yTex = Math.floor((yPixel - Math.floor(yPixel)) * texFloor.height);
          
          // const xTex = Math.floor(xPixel * texFloor.width) % texFloor.width;
          // const yTex = Math.floor(yPixel * texFloor.height) % texFloor.height;
          
          const [ R, G, B, A ] = texFloor.getRGBA(xTex, yTex);
          
          this.putRGBShade(x, y, zDepth, R, G, B);
        }
      }
    }
  }
  
  putRGBAShade(x, y, zDepth, R, G, B, A)
  {
    if (A == 0) {
      return;
    } else if (A < 255) {
      const [ bgR, bgG, bgB ] = this.bitmap.getRGB(x, y);
      
      const dR = R - bgR;
      const dG = G - bgG;
      const dB = B - bgB;
      
      const lerp = A / 255.0;
      
      const shadeR = Math.floor(bgR + dR * lerp);
      const shadeG = Math.floor(bgG + dG * lerp);
      const shadeB = Math.floor(bgB + dB * lerp);
      
      this.putRGBShade(x, y, zDepth, shadeR, shadeG, shadeB);
    } else {
      this.putRGBShade(x, y, zDepth, R, G, B);
    }
  }
  
  putRGBShade(x, y, zDepth, R, G, B)
  {
    const lerp2 = 10.0 / (zDepth * zDepth * zDepth);
    const lerp = 1.0 - Math.min(lerp2, 1.0);
    
    const dR = FOG_COLOR[0] - R;
    const dG = FOG_COLOR[1] - G;
    const dB = FOG_COLOR[2] - B;
    
    const shadeR = Math.floor(R + dR * lerp);
    const shadeG = Math.floor(G + dG * lerp);
    const shadeB = Math.floor(B + dB * lerp);
    
    this.bitmap.putRGB(x, y, shadeR, shadeG, shadeB);
  }
};
