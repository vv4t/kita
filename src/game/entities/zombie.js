import { Entity } from "./baseEntity.js";
import { AnimationEngine, Animation } from "../../gfx/animation.js";
import { Vector3 } from "../../util/math.js";

export class Zombie extends Entity {
    constructor(pos) {
        super(pos, 0.1, 0.1, 0);

        const animationStates =  {
            "idle" : new Animation(0, 2, 600),
            "aggro" : new Animation(2, 2, 200)
        } 
        this.animation = new AnimationEngine("idle", animationStates)
    }

    update(delta, game, userCommand) {        
        //some example logic to demonstrate animation states
        const distanceFromPlayer = this.pos.copy().sub(game.player.pos).length()
        if (distanceFromPlayer < 2) {
            this.animation.state = "aggro"
        } else {
            this.animation.state = "idle"
        }

        this.spriteID = this.animation.getCurrentFrame() 
    }
}