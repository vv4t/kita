import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";

class TsConfig {
  constructor(solid)
  {
    this.solid = solid;
  }
};

class TsFile {
  constructor(src, imgWidth, imgHeight, columns, tsWidth, tsHeight, tsCount, tsConfig)
  {
    this.src = src;
    this.imgWidth = imgWidth;
    this.imgHeight = imgHeight;
    this.columns = columns;
    this.tsWidth = tsWidth;
    this.tsHeight = tsHeight;
    this.tsCount = tsCount;
    this.tsConfig = tsConfig;
  }
};

function getProperty(name, properties)
{
  const res = properties.find(x => x.property.name == name);
  
  if (res)
    return res.property.value;
  
  return null;
}

function tsxToTs(tsxPath)
{
  const xmlData = fs.readFileSync(tsxPath);
  
  const options = {
    ignoreAttributes: false,
    attributeNamePrefix: ""
  };
  
  const parser = new XMLParser(options);
  const tileset = parser.parse(xmlData).tileset;
  
  const tsConfig = {};
  if (tileset.tile) {
    const tiles = [].concat(tileset.tile);
    
    for (const tile of tiles) {
      const properties = [].concat(tile.properties);
      const id = parseInt(tile.id);
      const solid = getProperty("solid", properties) == "true";
      
      tsConfig[id] = new TsConfig(solid);
    }
  }
  
  const src = path.parse(tileset.image.source).name;
  
  return new TsFile(
    src,
    parseInt(tileset.image.width), parseInt(tileset.image.height), parseInt(tileset.columns),
    parseInt(tileset.tilewidth), parseInt(tileset.tileheight),
    parseInt(tileset.tilecount),
    tsConfig
  );
}

function main()
{
  if (process.argv.length != 4) {
    console.log("usage:", path.parse(process.argv[1]).name, "<tsx> <ts>");
    process.exit(1);
  }
  
  const tsxPath = process.argv[2];
  const tsPath = process.argv[3];
  
  const tsFile = tsxToTs(tsxPath);
  
  fs.writeFileSync(tsPath, JSON.stringify(tsFile));
}

main();
