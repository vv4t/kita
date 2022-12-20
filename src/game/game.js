/*
--- game.js ---

The main game logic class
*/

import { mapLoad } from "./map.js";
import { Player } from "./player.js";
import { Vector3 } from "../util/math.js";

export class Game {
  constructor()
  {
    this.map = null; // null until mapLoad is called
    this.player = new Player(new Vector3(3.0, 3.0, 0.2), 0.0);
    
    // Event callbacks
    // Used to notify other systems when something specific to game logic happens
    // Example: when the player hits a level load trigger and causes the map to change
    this.onMapLoadCallbacks = [];
  }
  
  // Advance the game state by "delta" seconds
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
    // Load in a map (this is async)
    // This is probably gonna 
    mapLoad("nexus", (map) => {
      this.map = map;
      
      // Trigger "mapLoad" event
      // TODO: change this into a single function like 'this.triggerEvent("mapLoad") (???)
      for (const mapLoadCallback of this.onMapLoadCallbacks)
        mapLoadCallback(map);
    });
  }
};
