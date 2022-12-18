import { mapLoad } from "./map.js";
import { Player } from "./player.js";
import { Vector3 } from "../util/math.js";

export class Game {
  constructor()
  {
    this.map = null;
    this.player = new Player(new Vector3(3.0, 3.0, 0.2), 0.0);
  }
  
  update(delta, userCommand)
  {
    this.player.lookMove(delta, userCommand, this.map);
  }
  
  mapLoad(mapName)
  {
    mapLoad("nexus", (map) => {
      this.map = map;
    });
  }
};
