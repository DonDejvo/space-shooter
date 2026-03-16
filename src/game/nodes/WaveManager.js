import { SceneNode } from "../../core/SceneNode.js";
import { EnemyShip } from "./EnemyShip.js";
import { HUDText } from "./HUDText.js";
import { Vector } from "../../utils/Vector.js";

export class WaveManager extends SceneNode {
    constructor({ waves, sheets, player, enemies, lasers, mapH }) {
        super();
        this._waves   = waves;
        this._sheets  = sheets;
        this._player  = player;
        this._enemies = enemies; // shared ref — also used by CollisionSystem / Minimap
        this._lasers  = lasers;  // shared ref
        this._mapH    = mapH;

        this._currentWave       = -1; // -1 = countdown
        this._waveEnemyCount    = 0;
        this._waveDeadCount     = 0;
        this._allWavesDone      = false;
        this._countdownTimer    = 3;
        this._countdownNode     = null;
        this._nextWaveTriggered = false;
        this._nextWaveTimer     = 0;
    }

    start() {
        this._countdownNode = this.scene.addNode(new HUDText({
            text:     "3",
            color:    "#ffffff",
            fontSize: 48,
            life:     -1,
            anchor:   "top-center"
        }));
    }

    update(dt) {
        if (this._currentWave === -1) {
            this._countdownTimer -= dt;
            if (this._countdownTimer <= 0) {
                if (this._countdownNode?.scene) this.scene.removeNode(this._countdownNode);
                this._countdownNode = null;
                this._currentWave = 0;
                this._spawnWave(0);
            } else {
                if (this._countdownNode) {
                    this._countdownNode.text = `${Math.ceil(this._countdownTimer)}`;
                }
            }
            return;
        }

        if (this._nextWaveTriggered && this._nextWaveTimer > 0) {
            this._nextWaveTimer -= dt;
            if (this._nextWaveTimer <= 0) {
                this._nextWaveTriggered = false;
                this._currentWave++;
                this._spawnWave(this._currentWave);
            }
        }
    }

    _spawnWave(waveIndex) {
        const cfg         = this._waves[waveIndex];
        const spawnRadius = this._mapH * 0.4;

        for (let i = 0; i < cfg.count; i++) {
            const angle = (i / cfg.count) * Math.PI * 2 + Math.random() * 0.3;
            const r     = spawnRadius + (Math.random() - 0.5) * 30;
            const enemy = new EnemyShip({
                spritesheet:    this._sheets.enemy,
                laserSheet:     this._sheets.laser,
                explosionSheet: this._sheets.explosion,
                player:         this._player,
                onLaserSpawned: (laser) => this._lasers.push(laser)
            });
            enemy.position.set(Math.cos(angle) * r, Math.sin(angle) * r);
            enemy.on('death', (e) => this._onEnemyDeath(e));
            this.scene.addNode(enemy);
            this._enemies.push(enemy);
        }

        this._waveEnemyCount = cfg.count;
        this._waveDeadCount  = 0;

        this.scene.addNode(new HUDText({
            text:     `WAVE ${waveIndex + 1}`,
            color:    "#ffffff",
            fontSize: 32,
            life:     2.5,
            anchor:   "top-center"
        }));
    }

    _onEnemyDeath(enemy) {
        const idx = this._enemies.indexOf(enemy);
        if (idx !== -1) this._enemies.splice(idx, 1);
        this._waveDeadCount++;

        const threshold  = Math.floor(this._waveEnemyCount * 2 / 3);
        const isLastWave = this._currentWave === this._waves.length - 1;

        if (this._waveDeadCount >= threshold && !isLastWave && !this._nextWaveTriggered) {
            this._nextWaveTriggered = true;
            this._nextWaveTimer = 1.5;
        }

        if (isLastWave && this._enemies.length === 0) {
            if (this._allWavesDone) return;
            this._allWavesDone = true;
            this.emit('allWavesDone');
        }
    }
}
