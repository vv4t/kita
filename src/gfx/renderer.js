import { textureLoad } from "./texture.js";
import { clamp, Vector3 } from "../util/math.js";
import { spriteMapLoad } from "../gfx/spriteMap.js";
import { Map } from "../game/map.js";

class MapWall {
  constructor(start, end, tex)
  {
    this.start = start;
    this.end = end;
    this.tex = tex;
  }
};

class Camera {
  constructor(pos, rot, fov)
  {
    this.pos = pos;
    this.rot = rot;
    this.fov = fov;
  }
};

export class Renderer {
  constructor(bitmap)
  {
    this.bitmap = bitmap;
    
    this.halfWidth = this.bitmap.width / 2.0;
    this.halfHeight = this.bitmap.height / 2.0;
    
    this.zNear = 0.1;
    this.zBuffer = new Float32Array(this.bitmap.width * this.bitmap.height);
    
    this.fogColor = [ 0, 0, 0 ];
    
    this.camera = new Camera(new Vector3(0.0, 0.0, 0.0), 0.0, 2.0);
    
    this.map = null;
    this.mapSky = null;
    this.mapWalls = [];
    
    this.entitySpriteMap = null;
    spriteMapLoad("entitySprites", (spriteMap) => {
        this.entitySpriteMap = spriteMap
    })
  }
  
  renderGame(game)
  {
    this.lockCamera(game.player);
    this.renderMap();
    this.renderEntities(game.entities);
  }
  
  lockCamera(entity)
  {
    this.camera.pos = entity.pos;
    this.camera.rot = entity.rot;
  }
  
  renderMap()
  {
    if (!this.map)
      return;
    
    this.renderMapData();
    
    for (const mapWall of this.mapWalls)
      this.renderWall(mapWall.tex, mapWall.start, mapWall.end);
    
    for (const prop of this.map.getProps()) {
      this.renderSprite(
        this.map.getSpriteMap().getSprite(prop.spriteID).tex,
        new Vector3(prop.xPos, prop.yPos, 0.0));
    }
  }
  
  renderEntities(entities)
  {
    if (!this.entitySpriteMap)
      return;
    
    for (const entity of entities) {
      if (entity.spriteID == -1)
        continue;
      
      this.renderSprite(this.entitySpriteMap.getSprite(entity.spriteID).tex, entity.pos);
    }
  }
  
  mapLoad(map)
  {
    this.map = map;
    this.mapWalls = [];
    
    for (const wall of map.walls) {
      let start = new Vector3(-0.5, 0.0, 0.0);
      let end = new Vector3(+0.5, 0.0, 0.0);
      
      if (wall.tile & Map.FLIPPED_HORIZONTALLY_FLAG) {
        const tmp = start;
        start = end;
        end = tmp;
      }
      
      if (wall.tile & Map.FLIPPED_DIAGONALLY_FLAG) {
        start.rotateZ(Math.PI / 2.0);
        end.rotateZ(Math.PI / 2.0);
      }
      
      start.add(new Vector3(wall.xPos + 0.5, wall.yPos + 0.5, 0.0));
      end.add(new Vector3(wall.xPos + 0.5, wall.yPos + 0.5, 0.0));
      
      const tex = map.getSpriteMap().getSprite(wall.tile & 255).tex;
      this.mapWalls.push(new MapWall(start, end, tex));
    }
    
    if (map.sky) {
      textureLoad("assets/sky/" + map.sky + ".png", (mapSky) => {
        this.mapSky = mapSky;
      });
    }
  }
  
  renderSprite(spriteTex, spritePos)
  {
    const cosDir = Math.cos(-this.camera.rot);
    const sinDir = Math.sin(-this.camera.rot);
    
    const xCam = spritePos.x - this.camera.pos.x;
    const yCam = spritePos.y - this.camera.pos.y;
    const zCam = -spritePos.z + this.camera.pos.z;
    
    const xRot = xCam * cosDir - yCam * sinDir;
    const yRot = xCam * sinDir + yCam * cosDir;
    
    if (yRot < 0.01)
      return;
    
    const distFactor = this.bitmap.width / (yRot * this.camera.fov);
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
      
      let yTex = yTexStart;
      for (let y = yp0; y < yp1; y++) {
        yTex += texStep;
        
        const xt = Math.floor(xTex * spriteTex.width);
        const yt = Math.floor(yTex * spriteTex.height);
        
        const [ R, G, B, A ] = spriteTex.getRGBA(xt, yt);
        
        if (A > 0) {
          if (this.zBuffer[x + y * this.bitmap.width] < yRot)
            continue;
          this.zBuffer[x + y* this.bitmap.width] = yRot;
        }
        
        this.putRGBAShade(x, y, yRot, R, G, B, A);
      }
    }
  }
  
  renderWall(wallTex, wallStart, wallEnd)
  {
    let startPos = wallStart.copy().sub(this.camera.pos);
    let endPos = wallEnd.copy().sub(this.camera.pos);
    startPos.rotateZ(-this.camera.rot);
    endPos.rotateZ(-this.camera.rot);
    
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
    
    let distFactor0 = this.bitmap.width / (startPos.y * this.camera.fov);
    let distFactor1 = this.bitmap.width / (endPos.y * this.camera.fov);
    
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
      
      const tmp4 = startPos.z;
      startPos.z = endPos.z;
      endPos.z = tmp4;
      
      xTex0 = 1.0;
      xTexDir = -1.0;
    }
    
    let yPixel00 = (-startPos.z - 0.5) * distFactor0 + this.halfHeight;
    let yPixel10 = (-endPos.z - 0.5) * distFactor1 + this.halfHeight;
    let yPixel01 = (-startPos.z + 0.5) * distFactor0 + this.halfHeight;
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
    
    const xp0 = Math.floor(xPixel0);
    const xp1 = Math.floor(xPixel1);
    
    for (let x = xp0; x < xp1; x++) {
      const zPos = 1.0 / izInterp;
      const zInterp = (zPos - zPos0) / (zPos1 - zPos0);
      
      const xTex = xTex0 + xTexDir * zInterp;
      const xt = Math.floor(xTex * wallTex.height);
      
      const yp0 = Math.floor(yPixel0);
      const yp1 = Math.floor(yPixel1);
      
      const yTexelStep = 1.0 / (yPixel1 - yPixel0);
      
      let yTex = 0;
      for (let y = yp0; y < yp1; y++) {
        const yt = Math.floor(yTex * wallTex.height);
        
        const [ R, G, B, A ] = wallTex.getRGBA(xt, yt);
        
        if (A > 0) {
          if (this.zBuffer[x + y * this.bitmap.width] < zPos)
            continue;
          this.zBuffer[x + y * this.bitmap.width] = zPos;
        }
        
        this.putRGBAShade(x, y, zPos, R, G, B, A);
        
        yTex += yTexelStep;
      }
      
      yPixel0 += yDelta0;
      yPixel1 += yDelta1;
      izInterp += izDelta;
    }
  }
  
  renderMapData()
  {
    const cosDir = Math.cos(this.camera.rot);
    const sinDir = Math.sin(this.camera.rot);
    
    for (let x = 0; x < this.bitmap.width; x++) {
      const xCam = this.camera.fov * (x - this.halfWidth) / this.bitmap.width;
      
      const xRayDir = xCam * cosDir - sinDir;
      const yRayDir = xCam * sinDir + cosDir;
      
      const rayHit = this.map.rayCast(this.camera.pos, new Vector3(xRayDir, yRayDir, 0.0));
      const tile = this.map.getTile(rayHit.xMap, rayHit.yMap);
      const texWall = this.map.getSpriteMap().getSprite(tile & 255).tex;

      let wallDist, xWall;
      if (rayHit.side) {
        wallDist = rayHit.xDist;
        xWall = Math.abs(this.camera.pos.y + wallDist * yRayDir - rayHit.yMap);
      } else {
        wallDist = rayHit.yDist;
        xWall = Math.abs(this.camera.pos.x + wallDist * xRayDir - rayHit.xMap);
      }
      
      const wallStart = (-0.5 + this.camera.pos.z) / (this.camera.fov * wallDist) * this.bitmap.width;
      const wallEnd = (+0.5 + this.camera.pos.z) / (this.camera.fov * wallDist) * this.bitmap.width;
      const wallHeight = wallEnd - wallStart;
      
      const yPixel0 = Math.floor(this.halfHeight + wallStart);
      const yPixel1 = Math.ceil(this.halfHeight + wallEnd);
      
      let yWall = 0;
      if (yPixel0 < 0)
        yWall = -yPixel0 / wallHeight;
      
      const yWallStep = 1.0 / wallHeight;
      
      for (let y = 0; y < this.bitmap.height; y++) {
        if (y > yPixel0 && y < yPixel1) {
          yWall += yWallStep;
          
          const xTex = Math.floor(xWall * texWall.width);
          const yTex = Math.floor(yWall * texWall.height);
          
          const [ R, G, B, A ] = texWall.getRGBA(xTex, yTex);
          
          this.zBuffer[x + y * this.bitmap.width] = wallDist;
          this.putRGBShade(x, y, wallDist, R, G, B);
        } else {
          const yCam = this.camera.fov * (y - this.halfHeight) / this.bitmap.width;
          
          let zDepth;
          if (yCam < 0)
            zDepth = (-0.5 + this.camera.pos.z) / yCam;
          else
            zDepth = (+0.5 + this.camera.pos.z) / Math.max(yCam, 0.001);
          
          if (zDepth < 0.0)
            continue;
          
          const xDepth = xCam * zDepth;
          
          const xPixel = xDepth * cosDir - zDepth * sinDir + this.camera.pos.x;
          const yPixel = xDepth * sinDir + zDepth * cosDir + this.camera.pos.y;
          
          const xTile = Math.floor(xPixel);
          const yTile = Math.floor(yPixel);
          
          const floorTile = this.map.getTile(xTile, yTile) & 255;
          const ceilTile = (this.map.getTile(xTile, yTile) >> 8) & 255;
          
          if (ceilTile || y >= yPixel1) {
            let tex;
            if (y >= yPixel1)
              tex = this.map.getSpriteMap().getSprite(floorTile).tex
            else
              tex = this.map.getSpriteMap().getSprite(ceilTile - 1).tex
            
            let xTex = (xPixel - Math.floor(xPixel));
            let yTex = (yPixel - Math.floor(yPixel));
            
            if (tile & Map.FLIPPED_DIAGONALLY_FLAG) {
              const tmp = xTex;
              xTex = yTex;
              yTex = tmp;
            }
            
            if (tile & Map.FLIPPED_HORIZONTALLY_FLAG)
              xTex = 1.0 - xTex;
            if (tile & Map.FLIPPED_VERTICALLY_FLAG)
              yTex = 1.0 - yTex;
            
            const xt = Math.floor(xTex * tex.width);
            const yt = Math.floor(yTex * tex.height);
            
            const [ R, G, B, A ] = tex.getRGBA(xt, yt);
            
            this.zBuffer[x + y * this.bitmap.width] = zDepth;
            this.putRGBShade(x, y, zDepth, R, G, B);
          } else if (this.mapSky) {
            let xTex = Math.floor(x - this.camera.rot * this.bitmap.width / this.camera.fov);
            
            if (xTex < 0)
              xTex = this.mapSky.width - xTex;
            if (xTex >= this.mapSky.width)
              xTex = xTex % this.mapSky.width;
            
            const [ R, G, B, A ] = this.mapSky.getRGBA(xTex, y);
            
            this.zBuffer[x + y * this.bitmap.width] = 1000;
            this.putRGBAShade(x, y, zDepth, R, G, B, 255);
          }
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
    
    const dR = this.fogColor[0] - R;
    const dG = this.fogColor[1] - G;
    const dB = this.fogColor[2] - B;
    
    const shadeR = Math.floor(R + dR * lerp);
    const shadeG = Math.floor(G + dG * lerp);
    const shadeB = Math.floor(B + dB * lerp);
    
    this.bitmap.putRGB(x, y, shadeR, shadeG, shadeB);
  }
};
