export class Entity {
    constructor(pos, xBox, yBox, spriteID) {
        if (this.constructor == Entity) 
            throw new Error("Abstract base class Entity can not be instantiated.")

        this.pos = pos;
        
        this.xBox = xBox;
        this.yBox = yBox;

        this.spriteID = spriteID; //if spriteID == -1, there is no sprite !
    }

    update() {
        throw new Error("No update method implemented.")
    }

    clipMoveDir(moveDir, map)
    {
        const oldPosX = this.pos.x;
        const oldPosY = this.pos.y;
        const newPosX = this.pos.x + moveDir.x;
        const newPosY = this.pos.y + moveDir.y;
        
        if (map.collide(newPosX, newPosY, this.xBox, this.yBox)) {
        if (!map.collide(oldPosX, newPosY, this.xBox, this.yBox))
            moveDir.x = 0.0;
        else if (!map.collide(newPosX, oldPosY, this.xBox, this.yBox))
            moveDir.y = 0.0;
        else {
            moveDir.x = 0.0;
            moveDir.y = 0.0;
        }
        }
    }
}