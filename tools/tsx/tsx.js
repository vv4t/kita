import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";

const TS_PATH = "../../assets/ts/";
const SPR_PATH= "../../assets/spr/";

class TsConfig {
  constructor(id, solid)
  {
    this.id = id;
    this.solid = solid;
  }
};

class SprFile {
  constructor(src, imgWidth, imgHeight, columns, sprWidth, sprHeight, sprCount)
  {
    this.src = src;
    this.imgWidth = imgWidth;
    this.imgHeight = imgHeight;
    this.columns = columns;
    this.sprWidth = sprWidth;
    this.sprHeight = sprHeight;
    this.sprCount = sprCount;
  }
};

class TsFile {
  constructor(spr, tsConfig)
  {
    this.spr = spr;
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
  
  const tsConfig = [];
  if (tileset.tile) {
    const tiles = [].concat(tileset.tile);
    
    for (const tile of tiles) {
      const properties = [].concat(tile.properties);
      const id = parseInt(tile.id);
      const solid = getProperty("solid", properties) == "true";
      
      tsConfig.push(new TsConfig(id, solid));
    }
  }
  
  const src = path.parse(tileset.image.source).name;
  
  const sprPath = SPR_PATH + src + ".spr";
  const sprFile = new SprFile(
    src,
    parseInt(tileset.image.width), parseInt(tileset.image.height), parseInt(tileset.columns),
    parseInt(tileset.tilewidth), parseInt(tileset.tileheight),
    parseInt(tileset.tilecount)
  );
  
  fs.writeFileSync(sprPath, JSON.stringify(sprFile));
  
  return new TsFile(
    src,
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
  
  const tsPath = TS_PATH + process.argv[3] + ".ts";
  const tsFile = tsxToTs(tsxPath);
  
  fs.writeFileSync(tsPath, JSON.stringify(tsFile));
}

main();
