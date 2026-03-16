import { SceneNode } from "../../core/SceneNode.js";
import { Sprite } from "../../graphics/Sprite.js";

const SPRITE_FRAMES = 16;
const FRAME_ANGLE_STEP = (Math.PI * 2) / SPRITE_FRAMES;

// Drone is a logical game-object node that owns a Sprite child.
// Per course Lesson 3: game entities extend SceneNode, not a visual class.
export class Drone extends SceneNode {
    constructor(params) {
        super();
        this._spritesheet = params.spritesheet;
        this._sprite = null;
        this.facing = 0;
    }

    start() {
        this._sprite = this.addNode(new Sprite({
            spritesheet: this._spritesheet,
            zIndex: 10,
            isStatic: false,
            spriteRegion: { x: 0, y: 0 }
        }));
        this._sprite.scale.set(0.2, 0.2);
    }

    _updateSpriteFrame() {
        let a = this.facing % (Math.PI * 2);
        if (a < 0) a += Math.PI * 2;
        const frame = Math.round(a / FRAME_ANGLE_STEP) % SPRITE_FRAMES;
        this._sprite.setRegion(this._spritesheet.getSpriteXY(frame));
    }

    update() {
        // Keep the drone visually upright in world space while orbiting the ship.
        // worldAngle = 0 means the sprite never rotates regardless of parent rotation.
        this.worldAngle = 0;
        // Mirror the ship's facing direction for the sprite frame.
        this.facing = this._parent ? this._parent.facing : 0;
        this._updateSpriteFrame();
        // Child Sprite's needsUpdate is set automatically via Drawable.update
        // but since Drone is a SceneNode (not Drawable), we set it on the sprite directly.
        if (this._sprite) this._sprite.needsUpdate = true;
    }
}