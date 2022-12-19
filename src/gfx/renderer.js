import { textureLoad } from "./texture.js";
import { clamp, Vector3 } from "../util/math.js";

const FOG_COLOR = [ 0, 0, 0 ];

export class Renderer {
  constructor(bitmap)
  {
    this.fov = 2.0;
    this.bitmap = bitmap;
    this.halfWidth = this.bitmap.width / 2.0;
    this.halfHeight = this.bitmap.height / 2.0;
    this.zBuffer = new Float32Array(this.bitmap.width);
    this.zNear = 0.1;
  }
  
  renderGame(game)
  {
    if (game.map)
      this.renderMap(game.map, game.player.pos, game.player.rot);
    
    this.renderWall(null, new Vector3(4.0, 3.0, 0.0), new Vector3(3.0, 3.0, 0.0), game.player.pos, game.player.rot);
  }
  
  renderSprite(spriteTex, spritePos, camPos, camDir)
  {
    const cosDir = Math.cos(-camDir);
    const sinDir = Math.sin(-camDir);
    
    const xCam = spritePos.x - camPos.x;
    const yCam = spritePos.y - camPos.y;
    const zCam = -spritePos.z + camPos.z;
    
    const xRot = xCam * cosDir - yCam * sinDir;
    const yRot = xCam * sinDir + yCam * cosDir;
    
    if (yRot < 0.01)
      return;
    
    const distFactor = this.bitmap.width / (yRot * this.fov);
    const texStep = 1.0 / distFactor;
    
    let xPixel0 = (xRot - 0.5) * distFactor + this.halfWidth;
    let xPixel1 = (xRot + 0.5) * distFactor + this.halfWidth;
    let yPixel0 = (zCam - 0.5) * distFactor + this.halfHeight;
    let yPixel1 = (zCam + 0.5) * distFactor + this.halfHeight;
    
    let xTex = 0;
    if (xPixel0 < 0) {
      xTex = -xPixel0 / distFactor;
      xPixel0 = 0;
    }
    
    if (xPixel1 >= this.bitmap.width)
      xPixel1 = this.bitmap.width;
    
    let yTexStart = 0;
    if (yPixel0 < 0) {
      yTexStart = -yPixel0 / distFactor;
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
  
  renderWall(wallTex, wallStart, wallEnd, camPos, camDir)
  {
    let startPos = wallStart.sub(camPos);
    let endPos = wallEnd.sub(camPos);
    startPos.rotateZ(-camDir);
    endPos.rotateZ(-camDir);
    
    if (startPos.y < this.zNear && endPos.y < this.zNear)
      return;
    
    let zPos0 = startPos.y;
    let zPos1 = endPos.y;
    
    let izEnd = 1.0 / zPos1;
    let izInterp = 1.0 / zPos0;
    
    if (startPos.y < this.zNear) {
      const posDelta = (endPos.x - startPos.x) / (endPos.y - startPos.y);
      startPos.x += (this.zNear - startPos.y) * posDelta;
      startPos.y = this.zNear;
      izInterp = 1.0 / this.zNear;
    }
    
    if (endPos.y < this.zNear) {
      const posDelta = (startPos.x - endPos.x) / (startPos.y - endPos.y);
      endPos.x += (this.zNear - endPos.y) * posDelta;
      endPos.y = this.zNear;
      izEnd = 1.0 / this.zNear;
    }
    
    let distFactor0 = this.bitmap.width / (startPos.y * this.fov);
    let distFactor1 = this.bitmap.width / (endPos.y * this.fov);
    
    let xPixel0 = startPos.x * distFactor0 + this.halfWidth;
    let xPixel1 = endPos.x * distFactor1 + this.halfWidth;
    
    let xTex0 = 0.0;
    let xTexDir = 1.0;
    
    if (xPixel0 > xPixel1) {
      const tmp = xPixel0;
      xPixel0 = xPixel1;
      xPixel1 = tmp;
      
      const tmp1 = distFactor0;
      distFactor0 = distFactor1;
      distFactor1 = tmp1;
      
      const tmp2 = izInterp;
      izInterp = izEnd;
      izEnd = tmp2;
      
      const tmp3 = zPos0;
      zPos0 = zPos1;
      zPos1 = tmp3;
      
      xTex0 = 1.0;
      xTexDir = -1.0;
    }
    
    let yPixel00 = (-startPos.z - 0.5) * distFactor0 + this.halfHeight;
    let yPixel10 = (-startPos.z - 0.5) * distFactor1 + this.halfHeight;
    let yPixel01 = (-endPos.z + 0.5) * distFactor0 + this.halfHeight;
    let yPixel11 = (-endPos.z + 0.5) * distFactor1 + this.halfHeight;
    
    const xDelta = 1.0 / (xPixel1 - xPixel0);
    const yDelta0 = (yPixel10 - yPixel00) * xDelta;
    const yDelta1 = (yPixel11 - yPixel01) * xDelta;
    const izDelta = (izEnd - izInterp) * xDelta;
    
    let yPixel0 = yPixel00;
    let yPixel1 = yPixel01;
    
    if (xPixel0 < 0) {
      yPixel0 += -xPixel0 * yDelta0;
      yPixel1 += -xPixel0 * yDelta1;
      izInterp += -xPixel0 * izDelta;
      xPixel0 = 0;
    }
    
    if (xPixel1 >= this.bitmap.width)
      xPixel1 = this.bitmap.width;
    
    const xp0 = Math.ceil(xPixel0);
    const xp1 = Math.floor(xPixel1);
    
    for (let x = xp0; x < xp1; x++) {
      const zPos = 1.0 / izInterp;
      if (this.zBuffer[x] < zPos)
        continue;
      this.zBuffer[x] = zPos;
      
      const zInterp = (zPos - zPos0) / (zPos1 - zPos0);
      
      const xTex = xTex0 + xTexDir * zInterp;
      const xt = Math.floor(xTex * 8);
      
      const yp0 = Math.ceil(yPixel0);
      const yp1 = Math.floor(yPixel1);
      
      const yTexelStep = 1.0 / (yPixel1 - yPixel0);
      
      let yTex = 0;
      for (let y = yp0; y < yp1; y++) {
        const yt = Math.floor(yTex * 8);
        
        this.putRGBAShade(x, y, zPos, xt * 32, yt * 32, 0, 255);
        
        yTex += yTexelStep;
      }
      
      yPixel0 += yDelta0;
      yPixel1 += yDelta1;
      izInterp += izDelta;
    }
  }
  
  renderMap(map, pos, rot)
  {
    const cosDir = Math.cos(rot);
    const sinDir = Math.sin(rot);
    
    for (let x = 0; x < this.bitmap.width; x++) {
      const xCam = this.fov * (x - this.halfWidth) / this.bitmap.width;
      
      const xRayDir = xCam * cosDir - sinDir;
      const yRayDir = xCam * sinDir + cosDir;
      
      const rayHit = map.rayCast(pos, new Vector3(xRayDir, yRayDir, 0.0));
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
      
      const wallStart = (-0.5 + pos.z) / (this.fov * wallDist) * this.bitmap.width;
      const wallEnd = (+0.5 + pos.z) / (this.fov * wallDist) * this.bitmap.width;
      const wallHeight = wallEnd - wallStart;
      
      const yPixel0 = Math.floor(this.halfHeight + wallStart);
      const yPixel1 = Math.ceil(this.halfHeight + wallEnd);
      
      let yWall = 0;
      if (yPixel0 < 0)
        yWall = -yPixel0 / wallHeight;
      
      const yWallStep = 1.0 / wallHeight;
      
      for (let y = 0; y < this.bitmap.height; y++) {
        if (y < 0) {
          let xTex = Math.floor(x - rot * this.bitmap.width);
          
          if (xTex < 0)
            xTex = skyTex.width - xTex;
          if (xTex >= skyTex.width)
            xTex = xTex % skyTex.width;
          
          const [ R, G, B, A ] = skyTex.getRGBA(xTex, y);
          
          const yCam = this.fov * (y - this.halfHeight) / this.bitmap.width;
          const zDepth = Math.abs(0.5 / yCam);
          
          this.putRGBAShade(x, y, zDepth, R, G, B, 255);
        } else if (y > yPixel0 && y < yPixel1) {
          yWall += yWallStep;
          
          const xTex = Math.floor(xWall * texWall.width);
          const yTex = Math.floor(yWall * texWall.height);
          
          const [ R, G, B, A ] = texWall.getRGBA(xTex, yTex);
          
          this.putRGBShade(x, y, wallDist, R, G, B);
        } else {
          const yCam = this.fov * (y - this.halfHeight) / this.bitmap.width;
          
          let zDepth;
          if (yCam < 0)
            zDepth = (-0.5 + pos.z) / yCam;
          else
            zDepth = (+0.5 + pos.z) / Math.max(yCam, 0.001);
          
          if (zDepth < 0.0)
            continue;
          
          const xDepth = xCam * zDepth;
          
          const xPixel = xDepth * cosDir - zDepth * sinDir + pos.x;
          const yPixel = xDepth * sinDir + zDepth * cosDir + pos.y;
          
          const xTile = Math.floor(xPixel);
          const yTile = Math.floor(yPixel);
          
          const texFloor = map.getTile(xTile, yTile).tex;
          
          const xTex = Math.floor((xPixel - Math.floor(xPixel)) * texFloor.width);
          const yTex = Math.floor((yPixel - Math.floor(yPixel)) * texFloor.height);
          
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
    const lerp2 = 5.0 / (zDepth * zDepth);
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
