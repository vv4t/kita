import { Entity } from "./baseEntity.js";
import { Vector3 } from "../../util/math.js";
import { AnimationEngine, Animation } from "../../gfx/animation.js";

export class Zombie extends Entity {
    static nodes = []
    
    constructor(pos) {
        super(pos, new Vector3(0.1, 0.1, 1.0), 0);
        
        this.speed = 3

        const animationStates =  {
            "idle" : new Animation(8, 2, 300),
            "aggro" : new Animation(8, 2, 150)
        } 
        this.animation = new AnimationEngine("idle", animationStates)
    
        this.path = []
        this.pathfindingCounter = 0;
    }
    
    update(delta, game, userCommand) {
        if (this.pathfindingCounter % 30 == 0)
            this.path = game.paths.thetaStar(this.pos, game.player.pos);
        
        this.pathfindingCounter++;
        
        if (this.path.length != 0) {
            const [nodeX, nodeY] = this.path[0]
            const moveDir = new Vector3(
                (nodeX + 0.5) - this.pos.x,
                (nodeY + 0.5) - this.pos.y,
                0
            );
            
            moveDir.normalize()
                   .mulf(this.speed)
                   .mulf(delta);
            
            this.clipMove(moveDir, game.map);
        }

        // Some example logic to demonstrate animation states
        const distanceFromPlayer = this.pos.copy().sub(game.player.pos).length()
        if (distanceFromPlayer < 4) {
            this.animation.state = "aggro"
        } else {
            this.animation.state = "idle"
        }

        this.spriteID = this.animation.getCurrentFrame() 
    }
}
