import { Drawable } from "../../graphics/Drawable.js";

export class HUDText extends Drawable {
    constructor(params) {
        super({ zIndex: 90, isStatic: false, isScreenSpace: true, width: 400, height: 60 });
        this.text = params.text || "";
        this.color = params.color || "#ffffff";
        this.fontSize = params.fontSize || 28;
        this._life = params.life || -1; // -1 = permanent
        this._elapsed = 0;
        this.visible = true;
        // Position: "top-center", "center"
        this.anchor = params.anchor || "top-center";
    }

    update(dt) {
        this.needsUpdate = true;
        if (this._life > 0) {
            this._elapsed += dt;
            if (this._elapsed >= this._life && this.scene) {
                this.scene.removeNode(this);
            }
        }
    }

    render(renderer, camera) {
        if (!this.visible || !this.text) return;
        const { ctx } = renderer;
        ctx.setTransform(camera.projMatrix);

        let tx = camera.vw / 2;
        let ty = this.anchor === "center" ? camera.vh / 2 : 40;

        const alpha = (this._life > 0)
            ? Math.min(1, Math.min(this._elapsed / 0.3, (this._life - this._elapsed) / 0.4))
            : 1;

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.font = `bold ${this.fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "rgba(0,0,0,0.85)";
        ctx.lineWidth = 4;
        ctx.strokeText(this.text, tx, ty);
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, tx, ty);
        ctx.restore();
    }

    getBounds() {
        return { min: { x: -Infinity, y: -Infinity }, max: { x: Infinity, y: Infinity } };
    }
}
