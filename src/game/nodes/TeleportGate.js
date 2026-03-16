import { SceneNode } from "../../core/SceneNode.js";
import { Sprite } from "../../graphics/Sprite.js";
import { Animator } from "../../graphics/Animator.js";
import { Vector } from "../../utils/Vector.js";

const ACTIVATION_RADIUS = 80;

export class TeleportGate extends SceneNode {
    constructor(params) {
        super();
        this._spritesheet  = params.spritesheet;
        this._teleportAnim = params.teleportAnim;
        this._player       = params.player;
        this.position.copy(params.position || new Vector());
        this._activated = false;

        this._animator = null;
        this._sprite   = null;
    }

    start() {
        this._sprite = this.addNode(new Sprite({
            spritesheet: this._spritesheet,
            zIndex: 9,
            isStatic: false,
            spriteRegion: { x: 0, y: 0 }
        }));
        this._sprite.scale.set(1.0, 1.0);

        this._animator = this.addNode(new Animator(this._sprite));
        this._animator.on("AnimEnd", () => this.emit('activated'));
    }

    update(_dt) {
        if (this._activated || !this._player || this._player._dead) return;
        const dist = Vector.distance(this._player.position, this.position);
        if (dist < ACTIVATION_RADIUS) this._activate();
    }

    _activate() {
        if (this._activated) return;
        this._activated = true;
        this._animator.play(this._teleportAnim);
    }
}
