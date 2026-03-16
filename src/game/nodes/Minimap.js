import { Drawable } from "../../graphics/Drawable.js";

// Minimap is a screen-space HUD Drawable.
// It only reads game state — it never modifies it.
// Player position clamping is a gameplay concern handled by the scene/ship, not the HUD.
export class Minimap extends Drawable {
    constructor(params) {
        super({ zIndex: 100, isStatic: false, isScreenSpace: true, width: 120, height: 80 });
        this.mapW = params.mapW;
        this.mapH = params.mapH;
        this.player   = null;
        this.enemies  = [];
        this.teleport = null;

        this._mmW    = 120;
        this._mmH    = 80;
        this._margin = 10;
    }

    update(dt) {
        this.needsUpdate = true;
    }

    render(renderer, camera) {
        const { ctx } = renderer;
        ctx.setTransform(camera.projMatrix);

        const x = camera.vw - this._mmW - this._margin;
        const y = this._margin;
        const W = this._mmW;
        const H = this._mmH;

        // Background
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.strokeStyle = "rgba(100,180,255,0.6)";
        ctx.lineWidth = 1;
        ctx.fillRect(x, y, W, H);
        ctx.strokeRect(x, y, W, H);

        const toMM = (wx, wy) => ({
            x: x + (wx / this.mapW + 0.5) * W,
            y: y + (wy / this.mapH + 0.5) * H
        });

        // Teleport gate (cyan diamond)
        if (this.teleport) {
            const tp = toMM(this.teleport.position.x, this.teleport.position.y);
            ctx.fillStyle = "#00ffff";
            ctx.beginPath();
            ctx.moveTo(tp.x,     tp.y - 5);
            ctx.lineTo(tp.x + 4, tp.y);
            ctx.lineTo(tp.x,     tp.y + 5);
            ctx.lineTo(tp.x - 4, tp.y);
            ctx.closePath();
            ctx.fill();
        }

        // Enemies (red dots)
        ctx.fillStyle = "#ff3333";
        for (const e of this.enemies) {
            if (e._dead || !e.scene) continue;
            const ep = toMM(e.position.x, e.position.y);
            if (ep.x < x || ep.x > x + W || ep.y < y || ep.y > y + H) continue;
            ctx.beginPath();
            ctx.arc(ep.x, ep.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Player (green dot)
        if (this.player && !this.player._dead) {
            const pp = toMM(this.player.position.x, this.player.position.y);
            ctx.fillStyle = "#44ff88";
            ctx.beginPath();
            ctx.arc(pp.x, pp.y, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Label
        ctx.fillStyle = "rgba(150,200,255,0.7)";
        ctx.font = "9px Arial";
        ctx.textAlign = "left";
        ctx.fillText("MAP", x + 3, y + 10);
    }
}
