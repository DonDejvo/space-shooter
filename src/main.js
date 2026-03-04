import { Renderer } from "./graphics/Renderer.js";
import { Spritesheet } from "./graphics/Spritesheet.js";
import { InputManager } from "./input/InputManager.js";
import { KeyboardDevice } from "./input/KeyboardDevice.js";
import { PointerDevice } from "./input/PointerDevice.js";
import { assets } from "./utils/assets.js";
import { SceneManager } from "./core/SceneManager.js";

import { LoadingScene } from "./game/scenes/LoadingScene.js";
import { LevelScene } from "./game/scenes/LevelScene.js";

const main = async () => {

    // ── Canvas / Renderer ─────────────────────────────────────────────────────
    const canvas = document.querySelector("canvas");
    canvas.oncontextmenu = (e) => e.preventDefault();

    let VW = 720;
    let VH = 480;
    canvas.width  = VW;
    canvas.height = VH;

    const renderer = new Renderer(canvas);
    renderer.init();

    // ── Input ─────────────────────────────────────────────────────────────────
    const inputManager = InputManager.get();
    inputManager.keyboardDevice = new KeyboardDevice(inputManager);
    inputManager.pointerDevice  = new PointerDevice(inputManager, canvas);

    inputManager.addAction("game:start");
    inputManager.addBinding({ action: "game:start",      source: { device: "Pointer",   control: "StartBtn"     } });

    inputManager.addAction("game:fullscreen");
    inputManager.addBinding({ action: "game:fullscreen", source: { device: "Pointer",   control: "FsBtn"        } });

    inputManager.addAction("player:move");
    inputManager.addBinding({ action: "player:move",     source: { device: "Keyboard",  control: "WSAD"         } });
    inputManager.addBinding({ action: "player:move",     source: { device: "Pointer",   control: "MoveJoystick" } });

    inputManager.addAction("player:shoot");
    inputManager.addBinding({ action: "player:shoot",    source: { device: "Pointer",   control: "Position"     } });
    inputManager.addBinding({ action: "player:shoot",    source: { device: "Pointer",   control: "ShootJoystick"} });

    // ── Assets ────────────────────────────────────────────────────────────────
    const ASSETS_URL = "assets/";
    const ASSET_PATHS = {
        wallpaper: "wallpaper.png",
        player:    "playership.png",
        enemy:     "enemyship.png",
        drone:     "drone.png",
        laser:     "lasers.png",
        explosion: "explosion.png",
        teleport:  "teleport.png",
    };
    for (const k in ASSET_PATHS) ASSET_PATHS[k] = ASSETS_URL + ASSET_PATHS[k];

    const buildSheets = (images) => ({
        player:    new Spritesheet({ image: images.player,    spriteWidth: 256, spriteHeight: 256, columns: 4, spriteCount: 16 }),
        enemy:     new Spritesheet({ image: images.enemy,     spriteWidth: 256, spriteHeight: 256, columns: 4, spriteCount: 16 }),
        drone:     new Spritesheet({ image: images.drone,     spriteWidth: 256, spriteHeight: 256, columns: 4, spriteCount: 16 }),
        laser:     new Spritesheet({ image: images.laser,     spriteWidth: 256, spriteHeight: 256, columns: 4, spriteCount: 16 }),
        explosion: new Spritesheet({ image: images.explosion, spriteWidth: 256, spriteHeight: 256, columns: 4, spriteCount: 16 }),
        teleport:  new Spritesheet({ image: images.teleport,  spriteWidth: 256, spriteHeight: 256, columns: 4, spriteCount: 24 }),
    });

    // ── Scene Manager ─────────────────────────────────────────────────────────
    const sceneManager = SceneManager.get();

    const TOTAL_LEVELS = 3;
    let sheets = null;

    sceneManager.define("loading", ({ wallpaperImage, onStart }) =>
        new LoadingScene({ canvas, vw: VW, vh: VH, wallpaperImage, onStart })
    );

    sceneManager.define("level", ({ levelIndex, onNextLevel, onGameOver }) =>
        new LevelScene({ levelIndex, totalLevels: TOTAL_LEVELS, vw: VW, vh: VH, canvas, inputManager, sheets, onNextLevel, onGameOver })
    );

    // ── Level helpers ─────────────────────────────────────────────────────────
    const startLevel = (levelIndex) => {
        sceneManager.switchScene("level", {
            levelIndex,
            onNextLevel: () => {
                if (levelIndex + 1 < TOTAL_LEVELS) {
                    startLevel(levelIndex + 1);
                } else {
                    setTimeout(() => startLevel(0), 3000); // victory → restart
                }
            },
            onGameOver: () => startLevel(0)
        });
    };

    // ── Resize ────────────────────────────────────────────────────────────────
    const handleResize = () => {
        const vp           = window.visualViewport;
        const windowWidth  = vp ? vp.width  : window.innerWidth;
        const windowHeight = vp ? vp.height : window.innerHeight;

        VW = Math.ceil(VH * (windowWidth / windowHeight));

        canvas.width        = VW;
        canvas.height       = VH;
        canvas.style.width  = `${windowWidth}px`;
        canvas.style.height = `${windowHeight}px`;

        inputManager.pointerDevice.setViewportSize(VW, VH);

        const scene = sceneManager.currentScene;
        if (scene) {
            scene.onResize(VW, VH);
            scene.camera.setViewportSize(VW, VH);
        }
    };

    window.addEventListener("resize", handleResize);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", handleResize);
    handleResize();

    // ── Boot: loading scene ───────────────────────────────────────────────────
    const wallpaperImage = await assets.loadImage(ASSET_PATHS.wallpaper);

    const loadPromise = Promise.all(
        Object.entries(ASSET_PATHS).map(([k, v]) => assets.loadImage(v).then(img => [k, img]))
    ).then(entries => {
        sheets = buildSheets(Object.fromEntries(entries));
    });

    sceneManager.switchScene("loading", {
        wallpaperImage,
        onStart: () => startLevel(0)
    });

    loadPromise
        .then(() => sceneManager.currentScene.setLoaded?.())
        .catch(err => {
            console.warn("Asset load error (using fallback):", err);
            sceneManager.currentScene.setLoaded?.();
        });

    // ── Game loop ─────────────────────────────────────────────────────────────
    let lastRAF = 0;

    const loop = () => {
        requestAnimationFrame((now) => {
            loop();
            now *= 0.001;
            const dt = Math.min(now - (lastRAF || now), 0.05);
            lastRAF = now;

            sceneManager.update(dt);
            if(sceneManager.currentScene) {
                renderer.render(sceneManager.currentScene, sceneManager.currentScene.camera);
            }
        });
    };

    loop();
};

main();