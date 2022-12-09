import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";

class SprConfig {
  constructor(solid)
  {
    this.solid = solid;
  }
};

class SprFile {
  constructor(src, imgWidth, imgHeight, columns, sprWidth, sprHeight, sprCount, sprConfig)
  {
    this.src = src;
    this.imgWidth = imgWidth;
    this.imgHeight = imgHeight;
    this.columns = columns;
    this.sprWidth = sprWidth;
    this.sprHeight = sprHeight;
    this.sprCount = sprCount;
    this.sprConfig = sprConfig;
  }
};

function tsxToSpr(tsxPath)
{
  const xmlData = fs.readFileSync(tsxPath);
  
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: ""
  };
  
  const parser = new XMLParser(options);
  const tileset = parser.parse(xmlData).tileset;
  
  const tiles = [].concat(tileset.tile);
  
  const sprConfig = {};
  
  for (const tile of tiles) {
    const properties = [].concat(tile.properties);
    
    const id = parseInt(tile.id);
    const solid = properties.find(x => x.property.name == 'solid').property.value == "true";
    
    sprConfig[id] = new SprConfig(solid);
  }
  
  const src = path.parse(tileset.image.source).name;
  
  return new SprFile(
    src,
    parseInt(tileset.image.width), parseInt(tileset.image.height), parseInt(tileset.columns),
    parseInt(tileset.tilewidth), parseInt(tileset.tileheight),
    parseInt(tileset.tilecount),
    sprConfig
    );
}

function main()
{
  if (process.argv.length != 4) {
    console.log("usage:", path.parse(process.argv[1]).name, "<tsx> <spr>");
    process.exit(1);
  }
  
  const tsxPath = process.argv[2];
  const sprPath = process.argv[3];
  
  const sprFile = tsxToSpr(tsxPath);
  
  fs.writeFileSync(sprPath, JSON.stringify(sprFile));
}

main();
