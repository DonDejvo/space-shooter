import { Drawable } from "./Drawable.js";

export class Sprite extends Drawable {
    constructor(params) {
        super(params);
        this.spritesheet = params.spritesheet;
        this.width = this.spritesheet.spriteWidth;
        this.height = this.spritesheet.spriteHeight;
        this.region = { x: 0, y: 0, width: 0, height: 0 };
        this.setRegion(params.spriteRegion || { x: 0, y: 0 });
    }

    setRegion(sr) {
        const { spriteWidth: sw, spriteHeight: sh, spacing, margin } = this.spritesheet;
        this.region.x = sr.x * (sw + spacing) + margin;
        this.region.y = sr.y * (sh + spacing) + margin;
        this.region.width  = sw + ((sr.width  || 1) - 1) * (sw + spacing);
        this.region.height = sh + ((sr.height || 1) - 1) * (sh + spacing);
    }

    render(renderer, camera) {
        const { ctx } = renderer;
        const m = camera.projViewMatrix.multiply(this.modelMatrix);
        ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
        ctx.drawImage(
            this.spritesheet.image,
            this.region.x, this.region.y, this.region.width, this.region.height,
            -this.width / 2, -this.height / 2, this.width, this.height
        );
    }
}
