import { SceneNode } from "../../core/SceneNode.js";
import { HUDText } from "./HUDText.js";

export class GameManager extends SceneNode {
    constructor({ player, mapW, mapH, onGameOver }) {
        super();
        this._player          = player;
        this._mapW            = mapW;
        this._mapH            = mapH;
        this._onGameOver      = onGameOver;
        this._gameOverTriggered = false;
    }

    update(dt) {
        this._clampPlayer();
        this._checkPlayerDeath();
    }

    _clampPlayer() {
        if (!this._player || this._player._dead) return;
        const halfW = this._mapW / 2;
        const halfH = this._mapH / 2;
        this._player.position.x = Math.max(-halfW, Math.min(halfW, this._player.position.x));
        this._player.position.y = Math.max(-halfH, Math.min(halfH, this._player.position.y));
    }

    _checkPlayerDeath() {
        if (!this._player || !this._player._dead || this._gameOverTriggered) return;
        this._gameOverTriggered = true;
        this.scene.addNode(new HUDText({
            text:     "SHIP DESTROYED",
            color:    "#ff4444",
            fontSize: 36,
            life:     -1,
            anchor:   "center"
        }));
        setTimeout(() => this._onGameOver(), 2500);
    }
}
