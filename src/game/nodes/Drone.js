import { Sprite } from "../../graphics/Sprite.js";

const SPRITE_FRAMES = 16;
const FRAME_ANGLE_STEP = (Math.PI * 2) / SPRITE_FRAMES;

export class Drone extends Sprite {
    constructor(params) {
        super({
            spritesheet: params.spritesheet,
            zIndex: 10,
            isStatic: false,
            spriteRegion: { x: 0, y: 0 }
        });
        this.scale.set(0.2, 0.2);
    }

    _updateSpriteFrame() {
        let a = this.facing % (Math.PI * 2);
        if (a < 0) a += Math.PI * 2;
        const frame = Math.round(a / FRAME_ANGLE_STEP) % SPRITE_FRAMES;
        
        this.setRegion(this.spritesheet.getSpriteXY(frame));
    }

    update() {
        this.worldAngle = 0;
        this.facing = this.parent.facing;
        this._updateSpriteFrame();
    }
}