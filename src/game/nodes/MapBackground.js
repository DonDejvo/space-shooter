import { Drawable } from "../../graphics/Drawable.js";
import { Vector } from "../../utils/Vector.js";

// MapBackground renders the world boundary and subtle grid.
// It is a non-static Drawable because the camera moves and culling
// must re-evaluate its bounds every frame.
export class MapBackground extends Drawable {
    constructor(mapW, mapH) {
        super({ zIndex: -5, isStatic: false, isScreenSpace: false, width: mapW, height: mapH });
        this.mapW = mapW;
        this.mapH = mapH;
    }

    update(dt) {
        this.needsUpdate = true;
    }

    render(renderer, camera) {
        const { ctx } = renderer;
        const m = camera.projViewMatrix.multiply(this.modelMatrix);
        ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);

        const W = this.mapW, H = this.mapH;

        // Map boundary
        ctx.strokeStyle = "rgba(60,120,200,0.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(-W / 2, -H / 2, W, H);

        // Subtle grid
        ctx.strokeStyle = "rgba(40,60,120,0.5)";
        ctx.lineWidth = 1;
        const step = 80;
        for (let x = -W / 2; x <= W / 2; x += step) {
            ctx.beginPath(); ctx.moveTo(x, -H / 2); ctx.lineTo(x, H / 2); ctx.stroke();
        }
        for (let y = -H / 2; y <= H / 2; y += step) {
            ctx.beginPath(); ctx.moveTo(-W / 2, y); ctx.lineTo(W / 2, y); ctx.stroke();
        }
    }

    getBounds() {
        return {
            min: new Vector(-this.mapW / 2 - 10, -this.mapH / 2 - 10),
            max: new Vector( this.mapW / 2 + 10,  this.mapH / 2 + 10)
        };
    }
}
