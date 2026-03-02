import { Sprite } from "../../graphics/Sprite.js";

// Laser sprite frames: 0-7 blue (player), 8-15 red (enemy)
// Each rotated by 22.5° steps, symmetric so 8 frames covers 360°

export class Laser extends Sprite {
    constructor(params) {
        // Use small scale for lasers
        super({
            spritesheet: params.spritesheet,
            zIndex: 15,
            isStatic: false,
        });
        this.scale.set(0.2, 0.2);
        this.isPlayer = params.isPlayer;
        this.damage = params.damage;
        this.speed = params.speed || 320;
        this._dir = params.direction.clone(); // unit vector
        this._lifetime = params.lifetime || 2.2;
        this._elapsed = 0;

        this.position.copy(params.position);
        // Set facing angle for sprite
        // The sprite faces "up" at angle=0 which is -y direction
        // direction vector: we want the sprite to face along _dir
        // angle = atan2(dir.x, -dir.y) but engine's fromAngle uses -sin/cos (up=0)
        const angle = Math.atan2(-this._dir.x, -this._dir.y);

        // Pick frame based on angle: 8 frames cover 360°, step=45°
        // Player: frames 0-7, Enemy: frames 8-15
        const base = this.isPlayer ? 0 : 8;
        // Normalize angle to 0..2PI
        let a = angle % (Math.PI * 2);
        if (a < 0) a += Math.PI * 2;
        const frameIdx = Math.round(a / (Math.PI * 2) * 16) % 8;
        
        this.setRegion(params.spritesheet.getSpriteXY(base + frameIdx));
    }

    update(dt) {
        this._elapsed += dt;
        this.position.x += this._dir.x * this.speed * dt;
        this.position.y += this._dir.y * this.speed * dt;
        this.needsUpdate = true;
        if (this._elapsed >= this._lifetime && this.scene) {
            this.scene.removeNode(this);
        }
    }
}
