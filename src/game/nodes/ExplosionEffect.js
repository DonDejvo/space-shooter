import { Sprite } from "../../graphics/Sprite.js";
import { Animator, Animation } from "../../graphics/Animator.js";

export class ExplosionEffect extends Sprite {
    constructor(params) {
        super({
            spritesheet: params.spritesheet,
            zIndex: 45,
            isStatic: false,
            spriteRegion: { x: 0, y: 0 }
        });
        this.scale.set(0.5, 0.5);
        this.position.copy(params.position);
        this._animator = new Animator(this);
    }

    start() {
        super.start();
        this.addNode(this._animator);
        // 4x4 sheet = frames 0..15
        const frames = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
        const anim = new Animation(frames, { frameDuration: 55, repeat: false });
        this._animator.play(anim);
    }

    onMessage(message) {
        if(message.type === "AnimationCompleted") {
            this.scene.removeNode(this);
            message.stop();
        }
    }

    update(dt) {
        this.needsUpdate = true;
        if (this._animator) this._animator.update(dt);
    }
}
