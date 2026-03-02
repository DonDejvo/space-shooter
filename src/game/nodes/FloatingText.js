import { Drawable } from "../../graphics/Drawable.js";

export class FloatingText extends Drawable {
    constructor(params) {
        super({ zIndex: 40, isStatic: false, isScreenSpace: false, width: 60, height: 20 });
        this.text = params.text;
        this.color = params.color || "#ff4040";
        this.position.copy(params.position);
        this._life = 1.4;
        this._elapsed = 0;
        this._vy = -22; // world units/sec upward
    }

    update(dt) {
        this._elapsed += dt;
        this.position.y += this._vy * dt;
        this.needsUpdate = true;
        if (this._elapsed >= this._life && this.scene) {
            this.scene.removeNode(this);
        }
    }

    render(renderer, camera) {
        const { ctx } = renderer;
        const alpha = Math.max(0, 1 - this._elapsed / this._life);
        const m = camera.projViewMatrix.multiply(this.modelMatrix);
        ctx.save();
        ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);
        ctx.globalAlpha = alpha;
        ctx.font = "bold 14px 'Arial'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "rgba(0,0,0,0.8)";
        ctx.lineWidth = 3;
        ctx.strokeText(this.text, 0, 0);
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, 0, 0);
        ctx.restore();
    }
}
