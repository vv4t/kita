import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";

class MapFile {
  constructor(spr, sky, width, height, data, walls)
  {
    this.spr = spr;
    this.sky = sky;
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

function getProperty(name, properties)
{
  const res = properties.find(x => x.property.name == name);
  
  if (res)
    return res.property.value;
  
  return null;
}

function tmxToMap(tmxPath)
{
  const xmlData = fs.readFileSync(tmxPath);
  
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: ""
  };
  
  const parser = new XMLParser(options);
  let tmxMap = parser.parse(xmlData);
  
  const properties = tmxMap.map.properties ? [].concat(tmxMap.map.properties) : [];
  const sky = getProperty("sky", properties)
  
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
  
  const spr = path.parse(tmxMap.map.tileset.source).name;
  
  return new MapFile(spr, sky, baseWidth, baseHeight, baseData, walls);
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
