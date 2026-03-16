import { Ship } from "./Ship.js";
import { Laser } from "./Laser.js";
import { SceneNode } from "../../core/SceneNode.js";
import { Vector } from "../../utils/Vector.js";
import { random } from "../../utils/random.js";

export class PlayerShip extends Ship {
    constructor(params) {
        super({
            ...params,
            maxHp: 16000,
            maxShield: 20000,
            shieldRegenRate: 1000,
            hpRegenRate: 250,
            hpRegenDelay: 8
        });
        this._camera = params.camera;
        this.inputManager = params.inputManager;

        this.speed = 110;
        this._fireRate = 0.25;
        this._fireCooldown = 0;
        this._isShooting = false;
        this._aimDir = new Vector();
        this._moveDir = new Vector();
        this._healAccum = 0;

        this.droneAngle = 0;

        // droneOrigin is the parenting anchor for drone nodes.
        // It is created in start() via addNode() so it is owned by this ship.
        this.droneOrigin = new SceneNode();

        this._onMoveRef = (value) => { this._moveDir.copy(value); };
        this._onShootStartRef = (value) => { this._isShooting = true; this._aimDir.copy(value); };
        this._onShootChangeRef = (value) => { this._aimDir.copy(value); };
         this._onShootEndRef = () => {
            this._isShooting = false;
        }
        this._onLaserSpawned = params.onLaserSpawned || null;
    }

    start() {
        super.start();

        // droneOrigin is an owned child: created with addNode so it is
        // parented to this ship and updated/destroyed automatically.
        this.addNode(this.droneOrigin);

        this.inputManager.getAction("player:move").onChange.add(this._onMoveRef);
        this.inputManager.getAction("player:shoot").onStart.add(this._onShootStartRef);
        this.inputManager.getAction("player:shoot").onChange.add(this._onShootChangeRef);
        this.inputManager.getAction("player:shoot").onEnd.add(this._onShootEndRef);
    }

    destroy() {
        super.destroy();
        this.inputManager.getAction("player:move").onChange.delete(this._onMoveRef);
        this.inputManager.getAction("player:shoot").onStart.delete(this._onShootStartRef);
        this.inputManager.getAction("player:shoot").onChange.delete(this._onShootChangeRef);
        this.inputManager.getAction("player:shoot").onEnd.delete(this._onShootEndRef);
    }

    update(dt) {
        this.gameTime += dt;
        if (this._dead) return;

        const movLen = this._moveDir.len();
        if (movLen > 0) {
            this._moveDir.normalize();
            this.position.x += this._moveDir.x * this.speed * dt;
            this.position.y += this._moveDir.y * this.speed * dt;
            this.facing    = Math.atan2(-this._moveDir.x, -this._moveDir.y);
            this.droneAngle = Math.atan2(this._moveDir.x, -this._moveDir.y);
        }

        if (this._isShooting) {
            this.facing    = Math.atan2(-this._aimDir.x, -this._aimDir.y);
            this.droneAngle = Math.atan2(this._aimDir.x, -this._aimDir.y);
        }

        // Shooting
        this._fireCooldown -= dt;
        if (this._isShooting && this._fireCooldown <= 0) {
            this._fireCooldown = this._fireRate;
            this._shoot();
        }

        // Shield regen
        if (this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate * dt);
        }

        // HP regen after delay since last hit
        if (this.hp < this.maxHp && (this.gameTime - this._lastHitTime) > this.hpRegenDelay) {
            const healed = this.hpRegenRate * dt;
            this._healAccum += healed;
            this.hp = Math.min(this.maxHp, this.hp + healed);
            if (this._healAccum >= 200) {
                this._healAccum = 0;
                this.showHeal(200);
            }
        } else {
            this._healAccum = 0;
        }

        this._updateSpriteFrame();

        // Keep droneOrigin co-located with the ship so drones follow correctly.
        // droneOrigin is a child node (local position = 0,0 relative to ship),
        // so only the angle needs updating.
        this.droneOrigin.angle = this.droneAngle;
        this.droneOrigin.facing = this.facing;

        // Camera follow
        this._camera.position.lerp(
            this.position.clone().sub(new Vector(this._camera.vw / 2, this._camera.vh / 2)),
            0.08
        );
    }

    _shoot() {
        if (!this.scene) return;
        if (this._aimDir.len() === 0) return;
        this._aimDir.normalize();

        const laser = new Laser({
            spritesheet: this._laserSheet,
            isPlayer: true,
            damage: random.randint(800, 1200),
            speed: 400,
            direction: this._aimDir,
            position: this.position.clone().add(this._aimDir.clone().scale(48)),
            lifetime: 0.5
        });
        this.scene.addNode(laser);
        if (this._onLaserSpawned) this._onLaserSpawned(laser);
    }
}
