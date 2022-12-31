import { mapLoad } from "./map.js";
import { Player } from "./entities/player.js";
import { Vector3 } from "../util/math.js";
import { Zombie } from "./entities/zombie.js";

export class Game {
  constructor()
  {
    this.map = null;
    this.entities = []
    
    this.player = new Player(new Vector3(3.0, 3.0, 0.2), 0.0);
    this.entities.push(this.player)

    this.entities.push(new Zombie(new Vector3(5.0, 2.0, 0.0))) //testing

    this.onMapLoadCallbacks = [];
  }
  
  update(delta, userCommand)
  {
    for (const entity of this.entities) {
      entity.update(delta, this, userCommand)
    }
  }
  
  addEventListener(eventName, callback)
  {
    switch (eventName) {
    case "mapLoad":
      this.onMapLoadCallbacks.push(callback);
      break;
    }
  }
  
  mapLoad(mapName)
  {
    mapLoad("nexus", (map) => {
      this.map = map;
      
      for (const mapLoadCallback of this.onMapLoadCallbacks)
        mapLoadCallback(map);
    });
  }
};
