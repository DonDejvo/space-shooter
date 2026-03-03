import { Sprite } from "../../graphics/Sprite.js";
import { Animator, Animation } from "../../graphics/Animator.js";
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
        this.onActivate = params.onActivate || null; // callback when teleport completes
        this._animator = new Animator(this);
    }

    start() {
        super.start();
        this.addNode(this._animator);
    }

    activate() {
        if (this._activated) return;
        this._activated = true;
        // 4 columns × 6 rows = 24 frames
        const frames = [];
        for (let i = 0; i < 24; i++) frames.push(i);
        const anim = new Animation(frames, { frameDuration: 100, repeat: false });
        this._animator.play(anim);
    }

    onMessage(message) {
        if (message.type === "AnimationCompleted") {
            if (this.onActivate) this.onActivate();
            message.stop();
        }
    }

    update(dt) {
        this.needsUpdate = true;
        if (this._animator) this._animator.update(dt);
    }
}
