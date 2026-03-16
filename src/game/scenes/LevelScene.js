import { Scene } from "../../core/Scene.js";
import { Camera } from "../../graphics/Camera.js";
import { ParallaxStars } from "../nodes/ParallaxStars.js";
import { PlayerShip } from "../nodes/PlayerShip.js";
import { TeleportGate } from "../nodes/TeleportGate.js";
import { Minimap } from "../nodes/Minimap.js";
import { HUDText } from "../nodes/HUDText.js";
import { CollisionSystem } from "../nodes/CollisionSystem.js";
import { MapBackground } from "../nodes/MapBackground.js";
import { WaveManager } from "../nodes/WaveManager.js";
import { GameManager } from "../nodes/GameManager.js";
import { Vector } from "../../utils/Vector.js";
import { KeyboardDPad } from "../../input/KeyboardDPad.js";
import { Joystick } from "../../input/Joystick.js";
import { PointerPosition } from "../../input/PointerPosition.js";
import { Drone } from "../nodes/Drone.js";

export class LevelScene extends Scene {
    constructor(params) {
        super();
        this._params = params;

        this._vw = params.vw;
        this._vh = params.vh;

        this.mapW = 2000;
        this.mapH = 1400;

        this._waves = [
            { count: 8 },
            { count: 12 },
            { count: 16 },
        ];
        this._enemies = [];
        this._lasers  = [];
        this._player  = null;
        this._minimap = null;
    }

    init() {
        const { sheets, inputManager } = this._params;

        this.camera = new Camera(this._vw, this._vh);
        this.addNode(this.camera);

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

        this.addNode(new ParallaxStars());

        const mapBg = new MapBackground(this.mapW, this.mapH);
        mapBg.position.set(0, 0);
        this.addNode(mapBg);

        // Player
        this._player = new PlayerShip({
            spritesheet:    sheets.player,
            laserSheet:     sheets.laser,
            explosionSheet: sheets.explosion,
            camera:         this.camera,
            inputManager,
            onLaserSpawned: (laser) => this._lasers.push(laser)
        });
        this._player.position.set(0, 0);
        this.addNode(this._player);

        const droneOffsets = [
            { x: -70, y: -20 },
            { x: -70, y:  10 },
            { x:  70, y: -20 },
            { x:  70, y:  10 },
            { x: -20, y:  70 },
            { x:  20, y:  70 },
            { x:   0, y:  90 },
        ];

        droneOffsets.forEach(offset => {
            const drone = new Drone({ spritesheet: sheets.drone });
            this.addNode(drone);
            drone.position.set(offset.x, offset.y);
            drone.setParent(this._player.droneOrigin, false);
        });

        this.camera.position.set(0, 0);

        this._minimap = new Minimap({ mapW: this.mapW, mapH: this.mapH });
        this._minimap.player  = this._player;
        this._minimap.enemies = this._enemies;
        this.addNode(this._minimap);

        this.addNode(new CollisionSystem({
            player:  this._player,
            enemies: this._enemies,
            lasers:  this._lasers
        }));

        this.addNode(new HUDText({
            text:     `LEVEL ${this._params.levelIndex + 1}`,
            color:    "#aaddff",
            fontSize: 20,
            life:     2.5,
            anchor:   "top-center"
        }));

        const waveManager = new WaveManager({
            waves:   this._waves,
            sheets,
            player:  this._player,
            enemies: this._enemies,
            lasers:  this._lasers,
            mapH:    this.mapH
        });
        waveManager.on('allWavesDone', () => this._onAllWavesDone(sheets));
        this.addNode(waveManager);

        this.addNode(new GameManager({
            player:     this._player,
            mapW:       this.mapW,
            mapH:       this.mapH,
            onGameOver: () => this._params.onGameOver()
        }));
    }

    _onAllWavesDone(sheets) {
        const teleport = new TeleportGate({
            spritesheet:  sheets.teleport,
            teleportAnim: this._params.anims.teleport,
            player:       this._player,
            position:     new Vector(0, 0)
        });
        teleport.once('activated', () => this._params.onNextLevel());
        this.addNode(teleport);
        this._minimap.teleport = teleport;

        this.addNode(new HUDText({
            text:     "AREA CLEAR — Find the portal!",
            color:    "#44ffaa",
            fontSize: 22,
            life:     3.5,
            anchor:   "top-center"
        }));
    }

    onResize(vw, vh) {
        this._vw = vw;
        this._vh = vh;
        this.findNode("ShootJoystick")?.position.set(this._vw - 140, this._vh - 120);
    }
}
