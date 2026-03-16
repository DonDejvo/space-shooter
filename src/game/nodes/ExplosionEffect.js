import { SceneNode } from "../../core/SceneNode.js";
import { Sprite } from "../../graphics/Sprite.js";
import { Animator } from "../../graphics/Animator.js";

// ExplosionEffect is a self-contained game-object node.
// Per course Lesson 3 & 6: the root is a SceneNode that owns a Sprite and
// an Animator as child nodes. The Animator is registered with the scene and
// receives update(dt) automatically — no manual call needed.
export class ExplosionEffect extends SceneNode {
    constructor(params) {
        super();
        this._spritesheet = params.spritesheet;
        this.position.copy(params.position);
    }

    start() {
        const sprite = this.addNode(new Sprite({
            spritesheet: this._spritesheet,
            zIndex: 45,
            isStatic: false,
            spriteRegion: { x: 0, y: 0 }
        }));
        sprite.scale.set(0.5, 0.5);

        const animator = this.addNode(new Animator(sprite));
        animator.once("AnimEnd", () => {
            if (this.scene) this.scene.removeNode(this);
        });
        animator.play(this.scene._params.anims.explosion);
    }
}
