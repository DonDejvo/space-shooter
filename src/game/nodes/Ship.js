import { Sprite } from "../../graphics/Sprite.js";
import { HealthBars } from "./HealthBars.js";
import { FloatingText } from "./FloatingText.js";
import { ExplosionEffect } from "./ExplosionEffect.js";
import { Vector } from "../../utils/Vector.js";

const SPRITE_FRAMES = 16;
const FRAME_ANGLE_STEP = (Math.PI * 2) / SPRITE_FRAMES; // 22.5° per frame

export class Ship extends Sprite {
    constructor(params) {
        super({
            spritesheet: params.spritesheet,
            zIndex: 10,
            isStatic: false,
            spriteRegion: { x: 0, y: 0 }
        });
        this.scale.set(0.5, 0.5);

        this.maxHp     = params.maxHp     || 100;
        this.hp        = this.maxHp;
        this.maxShield = params.maxShield || 60;
        this.shield    = this.maxShield;

        this.shieldRegenRate = params.shieldRegenRate || 4;
        this.hpRegenRate     = params.hpRegenRate     || 0;
        this.hpRegenDelay    = params.hpRegenDelay    || 5;

        this.gameTime     = 0;     // updated each frame by subclass
        this._lastHitTime = -9999;
        this._dead        = false;
        this._healthBars  = null;

        this._explosionSheet = params.explosionSheet || null;
        this._laserSheet     = params.laserSheet     || null;

        this.facing = 0; // radians; 0 = up (+Y negative direction)
    }

    start() {
        super.start();
        this._healthBars = new HealthBars(this);
        this.scene.addNode(this._healthBars);
    }

    _updateSpriteFrame() {
        let a = this.facing % (Math.PI * 2);
        if (a < 0) a += Math.PI * 2;
        const frame = Math.round(a / FRAME_ANGLE_STEP) % SPRITE_FRAMES;
        
        this.setRegion(this.spritesheet.getSpriteXY(frame));
    }

    takeDamage(amount) {
        if (this._dead) return;
        this._lastHitTime = this.gameTime;
        let dmg = amount;
        if (this.shield > 0) {
            const absorbed = Math.min(this.shield, dmg);
            this.shield -= absorbed;
            dmg -= absorbed;
        }
        if (dmg > 0) this.hp = Math.max(0, this.hp - dmg);

        if (this.scene) {
            const ft = new FloatingText({
                text: `-${Math.round(amount)}`,
                color: "#ff4040",
                position: this.position.clone().add(new Vector((Math.random() - 0.5) * 20, -20))
            });
            this.scene.addNode(ft);
        }

        if (this.hp <= 0) this._onDeath();
    }

    showHeal(amount) {
        if (!this.scene) return;
        const ft = new FloatingText({
            text: `+${Math.round(amount)}`,
            color: "#44ff88",
            position: this.position.clone().add(new Vector((Math.random() - 0.5) * 20, -20))
        });
        this.scene.addNode(ft);
    }

    _onDeath() {
        if (this._dead) return;
        this._dead = true;
        if (this.scene && this._explosionSheet) {
            const ex = new ExplosionEffect({
                spritesheet: this._explosionSheet,
                position: this.position.clone()
            });
            this.scene.addNode(ex);
        }
        if (this.scene) this.scene.removeNode(this);
    }

    update(dt) {
        this.needsUpdate = true;
    }

    destroy() {
        super.destroy();
        if (this._healthBars && this._healthBars.scene) {
            this._healthBars.scene.removeNode(this._healthBars);
            this._healthBars = null;
        }
    }
}
