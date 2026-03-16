import { SceneNode } from "../../core/SceneNode.js";
import { Vector } from "../../utils/Vector.js";

// CollisionSystem receives explicit arrays of game objects to test.
// It does NOT access scene internals (scene._nodes is private).
// Lasers are tracked via a shared array that callers populate.
export class CollisionSystem extends SceneNode {
    constructor(params) {
        super();
        this.player  = params.player;
        this.enemies = params.enemies;
        // A shared array of active Laser nodes provided by the scene.
        // The scene is responsible for adding/removing entries as lasers spawn/die.
        this.lasers  = params.lasers;
    }

    update(dt) {
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const laser = this.lasers[i];
            if (!laser.scene) {
                this.lasers.splice(i, 1);
                continue;
            }

            const lp = laser.position;

            if (laser.isPlayer) {
                for (const enemy of [...this.enemies]) {
                    if (enemy._dead || !enemy.scene) continue;
                    if (Vector.distance(lp, enemy.position) < 40) {
                        enemy.takeDamage(laser.damage);
                        if (laser.scene) {
                            laser.scene.removeNode(laser);
                            this.lasers.splice(i, 1);
                        }
                        break;
                    }
                }
            } else {
                const p = this.player;
                if (p && !p._dead && p.scene) {
                    if (Vector.distance(lp, p.position) < 40) {
                        p.takeDamage(laser.damage);
                        if (laser.scene) {
                            laser.scene.removeNode(laser);
                            this.lasers.splice(i, 1);
                        }
                    }
                }
            }
        }
    }
}
