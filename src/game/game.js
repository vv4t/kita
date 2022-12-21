import { mapLoad } from "./map.js";
import { Player } from "./player.js";
import { Vector3 } from "../util/math.js";

export class Game {
  constructor()
  {
    this.map = null;
    this.player = new Player(new Vector3(3.0, 3.0, 0.2), 0.0);
    this.onMapLoadCallbacks = [];
  }
  
  update(delta, userCommand)
  {
    this.player.lookMove(delta, userCommand, this.map);
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
