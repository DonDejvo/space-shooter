import { Drawable } from "../../graphics/Drawable.js";

// HealthBars is a Drawable child of Ship (added via Ship.start() → addNode).
// Because it is parented to Ship, its world position follows the ship automatically.
// The local Y offset places the bars below the ship center in local space.
export class HealthBars extends Drawable {
    constructor(ship) {
        super({ zIndex: 35, isStatic: false, isScreenSpace: false, width: 40, height: 12 });
        this.ship = ship;
        this._barW = 40;
        this._barH = 5;
        this._gap = 2;
        // Place bars below the ship sprite center in local space.
        this.position.y = 38;
    }

    update(dt) {
        // Position is maintained by the parent transform — nothing to do here.
        this.needsUpdate = true;
    }

    render(renderer, camera) {
        if (!this.ship || !this.ship.scene) return;
        const { ctx } = renderer;
        const m = camera.projViewMatrix.multiply(this.modelMatrix);

        ctx.save();
        ctx.setTransform(m.a, m.b, m.c, m.d, m.e, m.f);

        const bw = this._barW;
        const bh = this._barH;
        const gap = this._gap;

        // HP bar (green → yellow → red)
        const hpRatio = Math.max(0, this.ship.hp / this.ship.maxHp);
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(-bw / 2, -bh - gap / 2, bw, bh);
        ctx.fillStyle = hpRatio > 0.5 ? "#44dd44" : hpRatio > 0.25 ? "#dddd22" : "#dd3333";
        ctx.fillRect(-bw / 2, -bh - gap / 2, bw * hpRatio, bh);

        // Shield bar (blue)
        const shRatio = Math.max(0, this.ship.shield / this.ship.maxShield);
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(-bw / 2, gap / 2, bw, bh);
        ctx.fillStyle = "#3399ff";
        ctx.fillRect(-bw / 2, gap / 2, bw * shRatio, bh);

        ctx.restore();
    }
}
