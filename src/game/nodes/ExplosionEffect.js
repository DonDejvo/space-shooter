import { Sprite } from "../../graphics/Sprite.js";
import { Animator } from "../../graphics/Animator.js";

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
        this._animator.once("AnimEnd", () => this.scene.removeNode(this));
        this._animator.play(this.scene._params.anims.explosion);
    }

    update(dt) {
        this.needsUpdate = true;
        if (this._animator) this._animator.update(dt);
    }
}
