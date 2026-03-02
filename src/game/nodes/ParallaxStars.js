import { Drawable } from "../../graphics/Drawable.js";

export class ParallaxStars extends Drawable {
    constructor() {
        super({ zIndex: -10, isStatic: false, isScreenSpace: true, width: 1, height: 1 });
        this._layers = this._buildLayers();
    }

    _buildLayers() {
        return [
            this._makeLayer(120, 0.8, 0.04, "rgba(255,255,255,0.35)"),
            this._makeLayer(60,  1.2, 0.13, "rgba(255,255,255,0.65)"),
            this._makeLayer(25,  1.9, 0.28, "rgba(200,215,255,1.0)"),
        ];
    }

    _makeLayer(count, radius, parallax, color) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({ ox: Math.random(), oy: Math.random() });
        }
        return { stars, radius, parallax, color };
    }

    update(dt) { this.needsUpdate = true; }

    render(renderer, camera) {
        const { ctx } = renderer;
        ctx.setTransform(camera.projMatrix);
        const cx = camera.position.x;
        const cy = camera.position.y;
        const W = camera.vw, H = camera.vh;

        for (const layer of this._layers) {
            ctx.fillStyle = layer.color;
            for (const s of layer.stars) {
                let x = ((s.ox * W - cx * layer.parallax) % W + W) % W;
                let y = ((s.oy * H - cy * layer.parallax) % H + H) % H;
                ctx.beginPath();
                ctx.arc(x, y, layer.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    getBounds() {
        return { min: { x: -Infinity, y: -Infinity }, max: { x: Infinity, y: Infinity } };
    }
}
