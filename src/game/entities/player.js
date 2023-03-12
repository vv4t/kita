import { Vector3 } from "../../util/math.js";
import { Entity } from "./baseEntity.js";

export class Player extends Entity {
  constructor(pos, rot)
  {
    super(pos, new Vector3(0.1, 0.1, 1.0), -1); // arbitary spriteID -1 indicates no sprite !! mayb put in a constant or something

    this.moveSpeed = 4.0;
    this.moveInterp = 0.0;
    this.rot = rot;
  }
  
  update(delta, game, userCommand) {
    this.rot = userCommand.rot;
    this.bob();
    this.move(delta, game.map, userCommand)  
  }
  
  bob()
  {
    this.pos.z = 0.1 + Math.cos(this.moveInterp * 10) * 0.03;
  }

  move(delta, map, userCommand)
  {
    if (userCommand.side || userCommand.forward) {
      const moveDir = new Vector3(userCommand.side, userCommand.forward, 0.0);
      moveDir.rotateZ(userCommand.rot);
      moveDir.normalize();
      moveDir.mulf(this.moveSpeed * delta);
      
      this.clipMoveDir(moveDir, map);
      this.pos.add(moveDir);
      
      this.moveInterp += delta;
    } else {
      this.moveInterp = 0.0;
    }
  }
};
