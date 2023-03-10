import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";

const MAP_PATH = "../../assets/map/";

class MapFile {
  constructor(ts, sky, width, height, data, walls, props)
  {
    this.ts = ts;
    this.sky = sky;
    this.width = width;
    this.height = height;
    this.data = data;
    this.walls = walls;
    this.props = props;
  }
};

class Prop {
  constructor(spriteID, xPos, yPos, width, height)
  {
    this.spriteID = spriteID;
    this.xPos = xPos;
    this.yPos = yPos;
    this.width = width;
    this.height = height;
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
  const tmxMap = parser.parse(xmlData);
  
  const properties = tmxMap.map.properties ? [].concat(tmxMap.map.properties) : [];
  const sky = getProperty("sky", properties)
  
  const floorLayer = tmxMap.map.layer.find(x => x.name == "floor");
  const floorData = floorLayer.data["#text"].replace(/\s/g, '').split(',').map((x) => (parseInt(x)));
  const floorWidth = parseInt(floorLayer.width);
  const floorHeight = parseInt(floorLayer.height);
  
  const ceilLayer = tmxMap.map.layer.find(x => x.name == "ceil");
  const ceilData = ceilLayer.data["#text"].replace(/\s/g, '').split(',').map((x) => (parseInt(x)));
  
  const wallLayer = tmxMap.map.layer.find(x => x.name == "wall");
  const wallData = wallLayer.data["#text"].replace(/\s/g, '').split(',').map((x) => (parseInt(x)));
  
  const walls = {};
  const props = [];
  const data = [];
  
  const groups = [].concat(tmxMap.map.objectgroup);
  const propGroup = groups.find(x => x.name == "props");
  
  if (propGroup && propGroup.object) {
    const mapProps = [].concat(propGroup.object);
    
    for (const prop of mapProps) {
      const id = parseInt(prop.gid) - 1;
      const xPos = parseFloat(prop.x) / parseFloat(tmxMap.map.tilewidth);
      const yPos = parseFloat(prop.y) / parseFloat(tmxMap.map.tileheight);
      const width = parseFloat(prop.width) / parseFloat(tmxMap.map.tilewidth);
      const height = parseFloat(prop.height) / parseFloat(tmxMap.map.tileheight);
      
      props.push(new Prop(id, xPos, yPos, width, height));
    }
  }
  
  for (let y = 0; y < floorHeight; y++) {
    for (let x = 0; x < floorWidth; x++) {
      const floorTile = floorData[x + y * floorWidth];
      const ceilTile = ceilData[x + y * floorWidth] & 255;
      
      const tile = floorTile | (ceilTile << 8);
      
      data.push(tile);
    }
  }
  
  for (let y = 0; y < floorHeight; y++) {
    for (let x = 0; x < floorWidth; x++) {
      const tile = wallData[x + y * floorWidth];
      
      if (tile > 0)
        walls[x + y * floorWidth] = tile;
    }
  }
  
  const ts = path.parse(tmxMap.map.tileset.source).name;
  
  return new MapFile(ts, sky, floorWidth, floorHeight, data, walls, props);
}

function main()
{
  if (process.argv.length != 4) {
    console.log("usage:", path.parse(process.argv[1]).name, "[tmx] [map]");
    process.exit(1);
  }
  
  const tmxPath = process.argv[2];
  const mapPath = MAP_PATH + process.argv[3] + ".map";
  
  const mapFile = tmxToMap(tmxPath);
  
  fs.writeFileSync(mapPath, JSON.stringify(mapFile));
}

main();
