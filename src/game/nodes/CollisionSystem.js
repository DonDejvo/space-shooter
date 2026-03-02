import { SceneNode } from "../../core/SceneNode.js";
import { Laser } from "./Laser.js";
import { Vector } from "../../utils/Vector.js";

export class CollisionSystem extends SceneNode {
    constructor(params) {
        super();
        this.player = params.player;
        this.enemies = params.enemies;
    }

    update(dt) {
        if (!this.scene) return;

        const lasers = this.scene._nodes.filter(n => n instanceof Laser && n.scene);

        for (const laser of lasers) {
            if (!laser.scene) continue;
            const lp = laser.position;

            if (laser.isPlayer) {
                for (const enemy of [...this.enemies]) {
                    if (enemy._dead || !enemy.scene) continue;
                    if (Vector.distance(lp, enemy.position) < 40) {
                        enemy.takeDamage(laser.damage);
                        if (laser.scene) laser.scene.removeNode(laser);
                        break;
                    }
                }
            } else {
                const p = this.player;
                if (p && !p._dead && p.scene) {
                    if (Vector.distance(lp, p.position) < 40) {
                        p.takeDamage(laser.damage);
                        if (laser.scene) laser.scene.removeNode(laser);
                    }
                }
            }
        }
    }
}
