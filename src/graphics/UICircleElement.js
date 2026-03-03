import { Vector } from "../utils/Vector.js";
import { UIElement } from "./UIElement.js";

export class UICircleElement extends UIElement {
    constructor(params) {
        super(params);

        this.radius = params.radius || 30;
    }

    collides(pos) {
        return Vector.distance(this.worldPosition, pos) <= this.radius * this.worldScale.x;
    }

    render(renderer, camera) {
        const { ctx } = renderer;

        const final = camera.projMatrix.multiply(this.modelMatrix);
        ctx.setTransform(final.a, final.b, final.c, final.d, final.e, final.f);

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        this.drawText(ctx);
    }
}