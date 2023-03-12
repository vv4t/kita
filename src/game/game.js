import { mapLoad } from "./map.js";
import { Paths } from "./paths.js";
import { Player } from "./entities/player.js";
import { Vector3 } from "../util/math.js";

export class Game {
  constructor()
  {
    this.map = null;
    this.paths = null;
    
    this.time = 0.0;
    
    this.entities = [];
    this.player = new Player(new Vector3(3.0, 3.0, 0.2), 0.0);
    this.entities.push(this.player);

    this.events = {};
    this.events["mapLoad"] = [];
  }
  
  update(delta, userCommand)
  {
    if (!this.map)
      return;
    
    this.time += delta;
    
    for (const entity of this.entities) {
      entity.update(delta, this, userCommand)
    }
  }
  
  addEventListener(eventName, action)
  {
    switch (eventName) {
    case "mapLoad":
      this.events["mapLoad"].push(action);
      break;
    }
  }
  
  unload()
  {
    this.entities = [];
    this.entities.push(this.player);
  }
  
  mapLoad(mapName)
  {
    mapLoad(mapName, (map) => {
      this.map = map;
      this.paths = new Paths(map);
      
      for (const action of this.events["mapLoad"])
        action(map);
    });
  }
};
