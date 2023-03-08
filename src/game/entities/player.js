import { Vector3 } from "../../util/math.js";
import { Entity } from "./baseEntity.js";

export class Player extends Entity {
  constructor(pos, rot)
  {
    super(pos, new Vector3(0.1, 0.1, 1.0), -1); // arbitary spriteID -1 indicates no sprite !! mayb put in a constant or something

    this.moveSpeed = 4.0;
    this.rot = rot;
    this.time = 0.0;
    
    this.isMoving = false;
  }
  
  update(delta, game, userCommand) {
    this.lookMove(delta, game.map, userCommand)  
  }

  lookMove(delta, map, userCommand)
  {
    this.time += delta;
    this.rot = userCommand.rot;
    
    if (userCommand.side || userCommand.forward) {
      const moveDir = new Vector3(userCommand.side, userCommand.forward, 0.0);
      moveDir.rotateZ(userCommand.rot);
      moveDir.normalize();
      moveDir.mulf(this.moveSpeed * delta);
      
      this.clipMoveDir(moveDir, map);
      
      this.pos.add(moveDir);
      
      this.pos.z = 0.1 + Math.cos(this.time * 10) * 0.03;
      
      this.isMoving = true;
    } else {
      this.pos.z = 0.1;
      this.isMoving = false;
    }
  }
};
