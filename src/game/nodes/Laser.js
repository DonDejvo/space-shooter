import { SceneNode } from "../../core/SceneNode.js";
import { Sprite } from "../../graphics/Sprite.js";

// Laser is a game-entity node that owns a Sprite child.
// Frames 0-7 = player (blue), Frames 8-15 = enemy (red).
// 8 directional frames per side, each rotated 45°.
export class Laser extends SceneNode {
    constructor(params) {
        super();
        this._spritesheet = params.spritesheet;
        this.isPlayer = params.isPlayer;
        this.damage   = params.damage;
        this.speed    = params.speed || 320;
        this._dir     = params.direction.clone();
        this._lifetime = params.lifetime || 2.2;
        this._elapsed  = 0;

        this.position.copy(params.position);

        // Resolve the sprite frame from the direction vector.
        // angle=0 means "up" (–Y). atan2 with flipped args matches the engine convention.
        const angle = Math.atan2(-this._dir.x, -this._dir.y);
        let a = angle % (Math.PI * 2);
        if (a < 0) a += Math.PI * 2;
        const base     = this.isPlayer ? 0 : 8;
        const frameIdx = Math.round(a / (Math.PI * 2) * 16) % 8;
        this._spriteRegionId = base + frameIdx;
    }

    start() {
        const sprite = this.addNode(new Sprite({
            spritesheet: this._spritesheet,
            zIndex: 15,
            isStatic: false,
        }));
        sprite.scale.set(0.2, 0.2);
        sprite.setRegion(this._spritesheet.getSpriteXY(this._spriteRegionId));
        this._sprite = sprite;
    }

    update(dt) {
        this._elapsed += dt;
        this.position.x += this._dir.x * this.speed * dt;
        this.position.y += this._dir.y * this.speed * dt;
        if (this._sprite) this._sprite.needsUpdate = true;
        if (this._elapsed >= this._lifetime && this.scene) {
            this.scene.removeNode(this);
        }
    }
}
