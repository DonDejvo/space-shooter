import { Sprite } from "../../graphics/Sprite.js";
import { Animator } from "../../graphics/Animator.js";
import { Vector } from "../../utils/Vector.js";

export class TeleportGate extends Sprite {
    constructor(params) {
        super({
            spritesheet: params.spritesheet,
            zIndex: 9,
            isStatic: false,
            spriteRegion: { x: 0, y: 0 }
        });
        // Full scale (256x256)
        this.scale.set(1.0, 1.0);
        this.position.copy(params.position || new Vector());
        this._activated = false;
        this.onActivate = params.onActivate; // callback when teleport completes
        this._animator = new Animator(this);
    }

    start() {
        super.start();
        this.addNode(this._animator);
        this._animator.on("AnimEnd", this.onActivate);
    }

    activate() {
        if (this._activated) return;
        this._activated = true;
        this._animator.play(this.scene._params.anims.teleport);
    }

    update(dt) {
        this.needsUpdate = true;
        if (this._animator) this._animator.update(dt);
    }
}
