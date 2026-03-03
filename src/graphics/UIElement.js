import { bounds } from "../utils/bounds.js";
import { Drawable } from "./Drawable.js";

export class UIElement extends Drawable {
    constructor(params) {
        super({
            ...params,
            isScreenSpace: params.isScreenSpace ?? true
        });

        this.color = params.color || "rgba(255, 255, 255, 0.2)";

        this.text = params.text || "";
        this.textColor = params.textColor || "white";
        this.fontSize = params.fontSize || 16;
        this.fontFamily = params.fontFamily || "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    }

    collides(pos) {
        return bounds.containsPoint(this.getBounds(), pos);
    }

    render(renderer, camera) {
        const { ctx } = renderer;

        const final = camera.projMatrix.multiply(this.modelMatrix);
        ctx.setTransform(final.a, final.b, final.c, final.d, final.e, final.f);

        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        this.drawText(ctx);
    }

    drawText(ctx) {
        if(!this.text) return;

        ctx.fillStyle = this.textColor;
        ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(this.text, 0, 0);
    }
}