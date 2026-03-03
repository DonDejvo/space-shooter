import { Scene } from "../../core/Scene.js";
import { Camera } from "../../graphics/Camera.js";
import { ParallaxStars } from "../nodes/ParallaxStars.js";
import { PlayerShip } from "../nodes/PlayerShip.js";
import { EnemyShip } from "../nodes/EnemyShip.js";
import { TeleportGate } from "../nodes/TeleportGate.js";
import { Minimap } from "../nodes/Minimap.js";
import { HUDText } from "../nodes/HUDText.js";
import { CollisionSystem } from "../nodes/CollisionSystem.js";
import { Drawable } from "../../graphics/Drawable.js";
import { Vector } from "../../utils/Vector.js";
import { KeyboardDPad } from "../../input/KeyboardDPad.js";
import { Joystick } from "../../input/Joystick.js";
import { PointerPosition } from "../../input/PointerPosition.js";
import { Drone } from "../nodes/Drone.js";

// Subtle grid background for the map
class MapBackground extends Drawable {
    constructor(mapW, mapH) {
        super({ zIndex: -5, isStatic: false, isScreenSpace: false, width: mapW, height: mapH });
        this.mapW = mapW;
        this.mapH = mapH;
    }
    start() {
        super.start();
        this.needsUpdate = true;
    }
    computeMatrix() {
        super.computeMatrix();
        this.needsUpdate = true; // always update for camera
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
            max: new Vector(this.mapW / 2 + 10, this.mapH / 2 + 10)
        };
    }
}

export class LevelScene extends Scene {
    constructor(params) {
        super();
        this._params = params;
        // params: { levelIndex, totalLevels, vw, vh, canvas,
        //           inputManager, sheets: { player, enemy, laser, explosion, teleport },
        //           onNextLevel, onGameOver }

        this._vw = params.vw;
        this._vh = params.vh;
        this.camera = new Camera(params.vw, params.vh);

        // Map size: 3:2 ratio, using viewport width * 2.5
        this.mapW = 2000;
        this.mapH = 1400;

        this._waves = [
            { count: 8 },
            { count: 14 },
            { count: 20 },
        ];
        this._currentWave = -1; // -1 = countdown
        this._enemies = [];
        this._teleport = null;
        this._player = null;
        this._minimap = null;
        this._waveText = null;
        this._collisionSystem = null;
        this._countdownTimer = 3;
        this._countdownNode = null;
        this._waveActive = false;
        this._allWavesDone = false;
        this._gameTime = 0;
    }

    init() {
        const { canvas, inputManager, sheets } = this._params;

        const wsad = new KeyboardDPad(inputManager.keyboardDevice);
        wsad.name = "WSAD";
        this.addNode(wsad);

        const mapFunc = (pos) => pos.sub(new Vector(this._vw / 2, this._vh / 2)).normalize();
        const pointerPos = new PointerPosition(inputManager.pointerDevice, { mapFunc });
        pointerPos.name = "Position";
        this.addNode(pointerPos);

        if ("ontouchstart" in document) {
            const joystick = new Joystick(inputManager.pointerDevice, { priority: 10 });
            joystick.name = "MoveJoystick";
            joystick.position.set(140, this._vh - 120);
            this.addNode(joystick);

            const joystick2 = new Joystick(inputManager.pointerDevice, { priority: 10 });
            joystick2.name = "ShootJoystick";
            joystick2.position.set(this._vw - 140, this._vh - 120);
            this.addNode(joystick2);
        }

        // Stars background
        this.addNode(new ParallaxStars());

        // Map background
        const mapBg = new MapBackground(this.mapW, this.mapH);
        mapBg.position.set(0, 0);
        this.addNode(mapBg);

        // Player
        this._player = new PlayerShip({
            spritesheet: sheets.player,
            laserSheet: sheets.laser,
            explosionSheet: sheets.explosion,
            inputManager,
            camera: this.camera,
            canvas
        });
        this._player.position.set(0, 0);
        this.addNode(this._player);

        // --- DRONE SETUP ---
        // Define the 5 positions relative to the ship's origin
        // Negative Y is forward in many 2D top-down setups; adjust signs if your ship faces Right
        const droneOffsets = [
            { x: -70, y: -20 }, // Left front side 
            { x: -70, y: 10 }, // Left back side 
            { x: 70, y: -20 }, // Right front side
            { x: 70, y: 10 }, // Right back side
            { x: -20, y: 70 }, // Behind Left
            { x: 20, y: 70 }, // Behind Right
            { x: 0, y: 90 }  // Middle (slightly further back)
        ];

        droneOffsets.forEach(offset => {
            const drone = new Drone({
                spritesheet: sheets.drone,
            });

            // Set position relative to the _droneOrigin
            drone.position.set(offset.x, offset.y);

            // Add to the player's origin node so they move/rotate with the ship
            this.addNode(drone);
            drone.setParent(this._player._droneOrigin);
        });
        // --------------------

        // Camera start position
        this.camera.position.set(0, 0);

        // Minimap
        this._minimap = new Minimap({ mapW: this.mapW, mapH: this.mapH });
        this._minimap.player = this._player;
        this._minimap.enemies = this._enemies;
        this.addNode(this._minimap);

        // Collision system
        this._collisionSystem = new CollisionSystem({ player: this._player, enemies: this._enemies });
        this.addNode(this._collisionSystem);

        // Level label (top center, fades)
        const levelLabel = new HUDText({
            text: `LEVEL ${this._params.levelIndex + 1}`,
            color: "#aaddff",
            fontSize: 20,
            life: 2.5,
            anchor: "top-center"
        });
        this.addNode(levelLabel);

        // Countdown text
        this._countdownNode = new HUDText({
            text: "3",
            color: "#ffffff",
            fontSize: 48,
            life: -1,
            anchor: "top-center"
        });
        this.addNode(this._countdownNode);
    }

    _spawnWave(waveIndex) {
        const { sheets } = this._params;
        const cfg = this._waves[waveIndex];
        const spawnRadius = this.mapH * 0.4;

        for (let i = 0; i < cfg.count; i++) {
            const angle = (i / cfg.count) * Math.PI * 2 + Math.random() * 0.3;
            const r = spawnRadius + (Math.random() - 0.5) * 30;
            const ex = Math.cos(angle) * r;
            const ey = Math.sin(angle) * r;

            const enemy = new EnemyShip({
                spritesheet: sheets.enemy,
                laserSheet: sheets.laser,
                explosionSheet: sheets.explosion,
                player: this._player,
                onDeath: (e) => this._onEnemyDeath(e)
            });
            enemy.position.set(ex, ey);
            this.addNode(enemy);
            this._enemies.push(enemy);
        }

        this._waveEnemyCount = cfg.count;
        this._waveDeadCount = 0;
        this._waveActive = true;

        // Wave announcement text
        const wt = new HUDText({
            text: `WAVE ${waveIndex + 1}`,
            color: "#ffffff",
            fontSize: 32,
            life: 2.5,
            anchor: "top-center"
        });
        this.addNode(wt);
    }

    _onEnemyDeath(enemy) {
        const idx = this._enemies.indexOf(enemy);
        if (idx !== -1) this._enemies.splice(idx, 1);
        this._waveDeadCount++;

        // Next wave starts when 2/3 dead
        const threshold = Math.floor(this._waveEnemyCount * 2 / 3);
        const isLastWave = this._currentWave === this._waves.length - 1;

        if (this._waveDeadCount >= threshold && !isLastWave && !this._nextWaveTriggered) {
            this._nextWaveTriggered = true;
            // Start next wave after short delay
            this._nextWaveTimer = 1.5;
        }

        // Check all enemies dead (last wave)
        if (isLastWave && this._enemies.length === 0) {
            this._onAllWavesDone();
        }
    }

    _onAllWavesDone() {
        if (this._allWavesDone) return;
        this._allWavesDone = true;

        // Spawn teleport gate at center
        const { sheets } = this._params;
        this._teleport = new TeleportGate({
            spritesheet: sheets.teleport,
            position: new Vector(0, 0),
            onActivate: () => this._params.onNextLevel()
        });
        this.addNode(this._teleport);
        this._minimap.teleport = this._teleport;

        const msg = new HUDText({
            text: "AREA CLEAR — Find the portal!",
            color: "#44ffaa",
            fontSize: 22,
            life: 3.5,
            anchor: "top-center"
        });
        this.addNode(msg);
    }

    update(dt) {
        this._gameTime += dt;
        super.update(dt);

        // Countdown before first wave
        if (this._currentWave === -1) {
            this._countdownTimer -= dt;
            const remaining = Math.ceil(this._countdownTimer);
            if (this._countdownNode) {
                if (this._countdownTimer <= 0) {
                    if (this._countdownNode.scene) this.removeNode(this._countdownNode);
                    this._countdownNode = null;
                    this._currentWave = 0;
                    this._nextWaveTriggered = false;
                    this._nextWaveTimer = 0;
                    this._spawnWave(0);
                } else {
                    this._countdownNode.text = `${remaining}`;
                }
            }
            return;
        }

        // Trigger next wave after timer
        if (this._nextWaveTriggered && this._nextWaveTimer > 0) {
            this._nextWaveTimer -= dt;
            if (this._nextWaveTimer <= 0) {
                this._nextWaveTriggered = false;
                this._currentWave++;
                this._spawnWave(this._currentWave);
            }
        }

        // Player-teleport collision
        if (this._teleport && this._player && !this._player._dead) {
            const dist = Vector.distance(this._player.position, this._teleport.position);
            if (dist < 80 && !this._teleport._activated) {
                this._teleport.activate();
            }
        }

        // Player death -> game over
        if (this._player && this._player._dead) {
            if (!this._gameOverTriggered) {
                this._gameOverTriggered = true;
                const msg = new HUDText({
                    text: "SHIP DESTROYED",
                    color: "#ff4444",
                    fontSize: 36,

                    life: -1,
                    anchor: "center"
                });
                this.addNode(msg);
                setTimeout(() => this._params.onGameOver(), 2500);
            }
        }
    }

    onResize(vw, vh) {
        this._vw = vw;
        this._vh = vh;

        this.findNode("ShootJoystick")?.position.set(this._vw - 140, this._vh - 120);
    }
}
