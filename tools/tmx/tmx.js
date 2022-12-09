import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";

class MapFile {
  sprFile;
  width;
  height;
  data;
  
  constructor(sprFile, width, height, data)
  {
    this.sprFile = sprFile;
    this.width = width;
    this.height = height;
    this.data = data;
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
  
  const layerData = tmxMap.map.layer.data["#text"].replace(/\s/g, '').split(',').map((x) => (parseInt(x) - 1));
  const layerWidth = parseInt(tmxMap.map.layer.width);
  const layerHeight = parseInt(tmxMap.map.layer.height);
  
  const sprFile = path.parse(tmxMap.map.tileset.source).name;
  
  return new MapFile(sprFile, layerWidth, layerHeight, layerData);
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
