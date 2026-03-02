import { Ship } from "./Ship.js";
import { Laser } from "./Laser.js";
import { Vector } from "../../utils/Vector.js";
import { InputManager } from "../../input/InputManager.js";
import { random } from "../../utils/random.js";
import { SceneNode } from "../../core/SceneNode.js";
import { math } from "../../utils/math.js";

export class PlayerShip extends Ship {
    constructor(params) {
        super({
            ...params,
            maxHp: 12000,
            maxShield: 20000,
            shieldRegenRate: 500,
            hpRegenRate: 250,
            hpRegenDelay: 10
        });
        this._inputManager = params.inputManager;
        this._camera = params.camera;
        this._canvas = params.canvas;
        this._moveJoystick = params.moveJoystick;

        this.speed = 110;
        this._fireRate = 0.25;
        this._fireCooldown = 0;
        this._isShooting = false;
        this._aimDir = new Vector();
        this._moveDir = new Vector();
        this._healAccum = 0;

        this.droneAngle = 0;

        this._postShootTimer = 0;
        this._postShootDuration = 1.5; // Seconds to keep facing the aim direction

        this._onMoveRef = (value) => {
            this._moveDir.copy(value);
        }

        this._onShootStartRef = (value) => {
            this._isShooting = true;
            this.handleAim(value);
        }

        this._onShootChageRef = (value) => {
            this.handleAim(value);
        }

        this._onShootEndRef = () => {
            this._isShooting = false;
        }

        this._droneOrigin = new SceneNode();
    }

    start() {
        super.start();

        const inputManager = InputManager.get();
        inputManager.getAction("player:move").onChange.add(this._onMoveRef);

        inputManager.getAction("player:shoot").onStart.add(this._onShootStartRef);

        inputManager.getAction("player:shoot").onChange.add(this._onShootChageRef);

        inputManager.getAction("player:shoot").onEnd.add(this._onShootEndRef);

        this.scene.addNode(this._droneOrigin);
    }

    destroy() {
        super.destroy();

        const inputManager = InputManager.get();
        inputManager.getAction("player:move").onChange.delete(this._onMoveRef);

        inputManager.getAction("player:shoot").onStart.delete(this._onShootStartRef);

        inputManager.getAction("player:shoot").onChange.delete(this._onShootChageRef);

        inputManager.getAction("player:shoot").onEnd.delete(this._onShootEndRef);
    }

    handleAim(viewPos) {
        this._aimDir.copy(viewPos).sub(new Vector(this.scene._vw / 2, this.scene._vh / 2)).normalize();
    }

    update(dt) {
        this.gameTime += dt;
        if (this._dead) return;
        this.needsUpdate = true;

        const movLen = this._moveDir.len();
        if (movLen > 0) {
            this._moveDir.normalize();
            this.position.x += this._moveDir.x * this.speed * dt;
            this.position.y += this._moveDir.y * this.speed * dt;
            // Face movement direction: atan2(dx, -dy) gives angle where 0=up
            this.facing = Math.atan2(-this._moveDir.x, -this._moveDir.y);
            this.droneAngle = Math.atan2(this._moveDir.x, -this._moveDir.y);
        }

        if (this._isShooting) {
            this.facing = Math.atan2(-this._aimDir.x, -this._aimDir.y);
            this.droneAngle = Math.atan2(this._aimDir.x, -this._aimDir.y);
        }

        // --- Shooting ---
        this._fireCooldown -= dt;
        if (this._isShooting && this._fireCooldown <= 0) {
            this._fireCooldown = this._fireRate;
            this._shoot();
        }

        // --- Shield regen ---
        if (this.shield < this.maxShield) {
            this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate * dt);
        }

        // --- HP regen (repair) - only after 5s since last hit ---
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

        this._droneOrigin.position.copy(this.position);
        this._droneOrigin.angle = this.droneAngle;
        this._droneOrigin.facing = this.facing;

        // Camera follow
        this._camera.position.lerp(this.position.clone().sub(new Vector(this._camera.vw / 2, this._camera.vh / 2)), 0.08);
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
            position: this.position.clone().add(this._aimDir.clone().scale(64)),
            lifetime: 0.5
        });
        this.scene.addNode(laser);
    }
}
