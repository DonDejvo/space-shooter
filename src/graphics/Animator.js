import { Message } from "../core/Message.js";
import { SceneNode } from "../core/SceneNode.js";

export class Animation {
    constructor(frames, options) {
        this.frames = frames;
        this.frameDuration = options.frameDuration;
        this.repeat = options.repeat || false;
    }
}

export class Animator extends SceneNode {
    constructor(sprite) {
        super();
        this.sprite = sprite;
        this.animation = null;
        this.currentFrameIndex = 0;
        this.frameTimer = 0;
    }

    setSprite(sprite) { this.sprite = sprite; this.animation = null; }

    play(anim) {
        if (!this.sprite) return;
        this.animation = anim;
        this.currentFrameIndex = 0;
        this.frameTimer = 0;
        this.sprite.setRegion(this.sprite.spritesheet.getSpriteXY(anim.frames[0]));
    }

    update(dt) {
        if (!this.animation || !this.sprite) return;
        this.frameTimer += dt * 1000;
        if (this.frameTimer < this.animation.frameDuration) return;
        this.frameTimer = 0;
        this.currentFrameIndex++;
        if (this.currentFrameIndex >= this.animation.frames.length) {
            if (this.animation.repeat) {
                this.currentFrameIndex = 0;
            } else {
                this.currentFrameIndex = this.animation.frames.length - 1;
                this.animation = null;
                this._onComplete = null;
                this.emit(new Message("AnimationCompleted", true));
                return;
            }
        }
        this.sprite.setRegion(this.sprite.spritesheet.getSpriteXY(this.animation.frames[this.currentFrameIndex]));
    }
}
