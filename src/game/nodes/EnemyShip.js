import { Ship } from "./Ship.js";
import { Laser } from "./Laser.js";
import { random } from "../../utils/random.js";

export class EnemyShip extends Ship {
    constructor(params) {
        super({
            ...params,
            maxHp: 2000,
            maxShield: 1000,
            shieldRegenRate: 100,
        });
        this._player = params.player;
        this.speed = 55;
        this._fireRange = 200;
        this._fireRate = 0.9;
        this._fireCooldown = Math.random() * this._fireRate;
        this.onDeath = params.onDeath || null;
    }

    _onDeath() {
        if (this._dead) return;
        if (this.onDeath) this.onDeath(this);
        super._onDeath();
    }

    update(dt) {
        if (this._dead) return;
        this.gameTime += dt;
        this.needsUpdate = true;

        const player = this._player;
        if (!player || player._dead || !player.scene) return;

        const toPlayer = player.position.clone().sub(this.position);
        const dist = toPlayer.len();

        if (dist > this._fireRange * 0.6) {
            toPlayer.normalize();
            this.position.x += toPlayer.x * this.speed * dt;
            this.position.y += toPlayer.y * this.speed * dt;
            this.facing = Math.atan2(-toPlayer.x, -toPlayer.y);
            this._updateSpriteFrame();
        }

        if (this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate * dt);
        }

        this._fireCooldown -= dt;
        if (dist < this._fireRange && this._fireCooldown <= 0) {
            this._fireCooldown = this._fireRate;
            this._shoot(player);
        }
    }

    _shoot(player) {
        if (!this.scene) return;
        const dir = player.position.clone().sub(this.position).normalize();
        const laser = new Laser({
            spritesheet: this._laserSheet,
            isPlayer: false,
            damage: random.randint(400, 600),
            speed: 400,
            direction: dir,
            position: this.position.clone().add(dir.clone().scale(18)),
            lifetime: 1.0
        });
        this.scene.addNode(laser);
    }
}
