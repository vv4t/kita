import { Entity } from "./baseEntity.js";
import { DefaultDict } from "../../util/defaultDict.js";
import { includesArray } from "../../util/includesArray.js";
import { PriorityQueue } from "../../util/priorityQueue.js";
import { euclidean_distance, Vector3 } from "../../util/math.js";
import { AnimationEngine, Animation } from "../../gfx/animation.js";

export class Zombie extends Entity {
    static nodes = []
    
    constructor(pos) {
        super(pos, new Vector3(0.1, 0.1, 1.0), 0);
        
        this.speed = 3

        const animationStates =  {
            "idle" : new Animation(0, 2, 300),
            "aggro" : new Animation(2, 2, 150)
        } 
        this.animation = new AnimationEngine("idle", animationStates)
    
        this.path = []
        this.pathfindingCounter = 0;
    }

    
    update(delta, game, userCommand) {
        if (this.pathfindingCounter % 30 == 0) {
            this.path = this.thetaStar(game.player.pos, game.map);
        }
        this.pathfindingCounter++;
        
        if (this.path.length != 0) {
            const [nodeX, nodeY] = this.path[0]
            const moveDir = new Vector3(
                (nodeX + 0.5) - this.pos.x,
                (nodeY + 0.5) - this.pos.y,
                0
            )  
            moveDir.normalize()
                   .mulf(this.speed)
                   .mulf(delta)
            this.clipMoveDir(moveDir, game.map);
            this.pos.add(moveDir)
        }

        //some example logic to demonstrate animation states
        const distanceFromPlayer = this.pos.copy().sub(game.player.pos).length()
        if (distanceFromPlayer < 4) {
            this.animation.state = "aggro"
        } else {
            this.animation.state = "idle"
        }

        this.spriteID = this.animation.getCurrentFrame() 
    }

    lineOfSight(pos1, pos2, map) {
        const posVector = new Vector3(pos1[0] + 0.5, pos1[1]  + 0.5, 0);
        const dirVector = new Vector3(pos2[0]-pos1[0], pos2[1]-pos1[1], 0).normalize();
        const rayHit = map.rayCast(posVector, dirVector);
        return rayHit.dist >= euclidean_distance(pos1, pos2);
    }

    getNeighbourNodes(pos, nodes, map) {
        const neighbourNodes = nodes.filter(
            (node) => this.lineOfSight(pos, node, map) &&
            !(node.every((v,i) => v === pos))
        ) 
        return neighbourNodes;
    }

    thetaStar(goalVec, map) {
        const start = [
            Math.floor(this.pos.x),
            Math.floor(this.pos.y)
        ];
        const goal = [
            Math.floor(goalVec.x),
            Math.floor(goalVec.y)
        ]

        // priority queue means nodes are evaluated from best to worst cost
        let openSet = new PriorityQueue((a, b) => a[1] < b[1]);
        let closedSet = [];
        let parent = new DefaultDict(null);

        // gScore[n] = shortest distance from start to n
        let gScore = new DefaultDict(Infinity); 
        
        gScore[start] = 0;
        parent[start] = start;
        openSet.push([start, 0])

        while (!openSet.isEmpty()) {
            let [current, cost] = openSet.pop();
            
            // reconstruct path when at goal
            if (current.every((v, i) => v === goal[i])) { //a1.every((v,i)=> v === a2[i]);
                let totalPath = [];
                while (!(current.every((v, i) => v === start[i]))){
                    totalPath.push(current);
                    current = parent[current];
                }           
                return totalPath.reverse()
            }
            
            // process each node only once.
            closedSet.push(current)

            // calculate cost of pathing to neighbouring nodes and place result into priorityqueue
            for (const neighbour of this.getNeighbourNodes(current, Zombie.nodes.concat([goal]), map)) {
                if (!includesArray(closedSet, neighbour)) {
                    const currentParent = parent[current];
                    if (this.lineOfSight(currentParent, neighbour, map)) {
                        const pathCost = gScore[currentParent] + euclidean_distance(currentParent, neighbour);
                        if (pathCost < gScore[neighbour]) {
                            gScore[neighbour] = pathCost;
                            parent[neighbour] = currentParent;
                            openSet.push([neighbour, gScore[neighbour] + euclidean_distance(neighbour, goal)]);
                        }
                    }
                    else {
                        const pathCost = gScore[current] + euclidean_distance(current, neighbour);
                        if (pathCost < gScore[neighbour]) {
                            gScore[neighbour] = pathCost;
                            parent[neighbour] = current;
                            openSet.push([neighbour, gScore[neighbour] + euclidean_distance(neighbour, goal)]);
                        }
                    }
                }
            }
        }

        return null;
    }

    static generateNodes(map) {
        Zombie.nodes = [];
        for (let x = 1; x < map.width - 1; x++) {
            for (let y = 1; y < map.height - 1; y++) {
                if (map.isSolid(x, y) && map.isCorner(x, y)) {
                    if (!map.isSolid(x+1, y+1))
                        Zombie.nodes.push([x+1,y+1]);
                    if (!map.isSolid(x+1, y-1))
                        Zombie.nodes.push([x+1,y-1]);
                    if (!map.isSolid(x-1, y+1))
                        Zombie.nodes.push([x-1,y+1]);
                    if (!map.isSolid(x-1, y-1))
                        Zombie.nodes.push([x-1,y-1]);
                }
            }
        }
        return Zombie.nodes;
    }    
}
