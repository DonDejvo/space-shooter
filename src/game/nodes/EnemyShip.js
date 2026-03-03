import { Ship } from "./Ship.js";
import { Laser } from "./Laser.js";
import { random } from "../../utils/random.js";
import { Vector } from "../../utils/Vector.js";

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
        this._fireRange = 240;
        this._fireRate = 0.9;
        this._fireCooldown = Math.random() * this._fireRate;
        this.onDeath = params.onDeath || null;

        this._moveTarget = new Vector();
        this._targetUpdateInterval = 1;
        this._targetUpdateTimer = 0;
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

        const toPlayer = this._player.position.clone().sub(this.position);
        const dist = toPlayer.len();

        this._targetUpdateTimer -= dt;

        // 1. Target Acquisition Logic
        if (this._targetUpdateTimer <= 0 && dist > this._fireRange) {
            this._targetUpdateTimer = this._targetUpdateInterval;
            const randomAngle = Math.random() * Math.PI * 2;
            this._moveTarget.copy(this._player.position.clone()
                .add(new Vector(this._fireRange * 0.6, 0).rot(randomAngle)));
        }

        // 2. Movement Logic
        const toTarget = this._moveTarget.clone().sub(this.position);
        const targetDist = toTarget.len();

        if (targetDist > 5) {
            const moveDir = toTarget.clone().normalize();
            this.position.x += moveDir.x * this.speed * dt;
            this.position.y += moveDir.y * this.speed * dt;
        }

        // 3. Facing Logic (The part you requested)
        if (dist < this._fireRange) {
            // Face the player when in range
            const lookDir = toPlayer.clone().normalize();
            this.facing = Math.atan2(-lookDir.x, -lookDir.y);
        } else if (targetDist > 0) {
            // Face the movement target when far away
            const moveDir = toTarget.clone().normalize();
            this.facing = Math.atan2(-moveDir.x, -moveDir.y);
        }

        this._updateSpriteFrame();

        // 4. Combat & Regeneration Logic
        if (this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate * dt);
        }

        this._fireCooldown -= dt;
        if (dist < this._fireRange && this._fireCooldown <= 0) {
            this._fireCooldown = this._fireRate;
            this._shoot(this._player);
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
            position: this.position.clone().add(dir.clone().scale(48)),
            lifetime: 1.0
        });
        this.scene.addNode(laser);
    }
}
