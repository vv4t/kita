import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";

class MapFile {
  constructor(sprFile, width, height, data, walls)
  {
    this.sprFile = sprFile;
    this.width = width;
    this.height = height;
    this.data = data;
    this.walls = walls;
  }
};

class Wall {
  constructor(tile, xPos, yPos)
  {
    this.tile = tile;
    this.xPos = xPos;
    this.yPos = yPos;
  }
};

function tmxToMap(tmxPath)
{
  const xmlData = fs.readFileSync(tmxPath);
  
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: ""
  };
  
  const parser = new XMLParser(options);
  let tmxMap = parser.parse(xmlData);
  
  const baseLayer = tmxMap.map.layer[0];
  const baseData = baseLayer.data["#text"].replace(/\s/g, '').split(',').map((x) => (parseInt(x) - 1));
  const baseWidth = parseInt(baseLayer.width);
  const baseHeight = parseInt(baseLayer.height);
  
  const wallLayer = tmxMap.map.layer[1];
  const wallData = wallLayer.data["#text"].replace(/\s/g, '').split(',').map((x) => (parseInt(x) - 1));
  
  const walls = [];
  
  for (let y = 0; y < baseHeight; y++) {
    for (let x = 0; x < baseWidth; x++) {
      const tile = wallData[x + y * baseHeight];
      
      if (tile > 0) {
        const id = tile;
        const xPos = x;
        const yPos = y;
        
        walls.push(new Wall(id, xPos, yPos));
      }
    }
  }
  
  const sprFile = path.parse(tmxMap.map.tileset.source).name;
  
  return new MapFile(sprFile, baseWidth, baseHeight, baseData, walls);
}

function main()
{
  if (process.argv.length != 4) {
    console.log("usage:", path.parse(process.argv[1]).name, "[tmx] [map]");
    process.exit(1);
  }
  
  const tmxPath = process.argv[2];
  const mapPath = process.argv[3];
  
  const mapFile = tmxToMap(tmxPath);
  
  fs.writeFileSync(mapPath, JSON.stringify(mapFile));
}

main();
