export class Entity {
    constructor(pos, size, spriteID) {
        if (this.constructor == Entity) 
            throw new Error("Abstract base class Entity can not be instantiated.")

        this.pos = pos;
        this.size = size;

        this.spriteID = spriteID; //if spriteID == -1, there is no sprite !
    }

    update() {
        throw new Error("No update method implemented.")
    }

    clipMove(step, map)
    {
        if (map.collide(newPosX, newPosY, this.size.x, this.size.y)) {
            if (!map.collide(oldPosX, newPosY, this.size.x, this.size.y))
                this.pos.x += step.x;
            else if (!map.collide(newPosX, oldPosY, this.size.x, this.size.y))
                this.pos.y += step.y;
            else {
                this.pos.x += step.x;
                this.pos.y += step.y;
            }
        }
    }
}
