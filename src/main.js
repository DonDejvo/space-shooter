import { Renderer } from "./graphics/Renderer.js";
import { Camera } from "./graphics/Camera.js";
import { Spritesheet } from "./graphics/Spritesheet.js";
import { InputManager } from "./input/InputManager.js";
import { KeyboardDevice } from "./input/KeyboardDevice.js";
import { PointerDevice } from "./input/PointerDevice.js";
import { assets } from "./utils/assets.js";

import { LoadingScene } from "./game/scenes/LoadingScene.js";
import { LevelScene } from "./game/scenes/LevelScene.js";

const main = async () => {

    // ── Canvas / Renderer ─────────────────────────────────────────────────────
    const canvas = document.querySelector("canvas");
    canvas.oncontextmenu = (e) => {
        e.preventDefault();
    }

    // Virtual viewport (game coordinates). 3:2 ratio.
    let VW = 720;
    let VH = 480;

    canvas.width = VW;
    canvas.height = VH;

    const renderer = new Renderer(canvas);
    renderer.init();

    // ── Input ─────────────────────────────────────────────────────────────────
    const inputManager = InputManager.get();
    inputManager.keyboardDevice = new KeyboardDevice(inputManager);
    inputManager.pointerDevice = new PointerDevice(inputManager, canvas);

    inputManager.addAction("game:start");
    inputManager.addBinding({
        action: "game:start",
        required: [],
        source: { device: "Pointer", control: "StartBtn" }
    });

    inputManager.addAction("game:fullscreen");
    inputManager.addBinding({
        action: "game:fullscreen",
        required: [],
        source: { device: "Pointer", control: "FsBtn" }
    });

    inputManager.addAction("player:move");
    inputManager.addBinding({
        action: "player:move",
        required: [],
        source: { device: "Keyboard", control: "WSAD" }
    });
    inputManager.addBinding({
        action: "player:move",
        required: [],
        source: { device: "Pointer", control: "MoveJoystick" }
    });

    inputManager.addAction("player:shoot");
    inputManager.addBinding({
        action: "player:shoot",
        required: [],
        source: { device: "Pointer", control: "Position" }
    });

    // ── Scene management ──────────────────────────────────────────────────────
    let currentScene = null;
    let currentCamera = null;

    const handleResize = () => {
        // Use visualViewport if available, otherwise fallback to innerWidth/Height
        const windowWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
        const windowHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

        const aspectRatio = windowWidth / windowHeight;

        // 1. Calculate the new Virtual Width (Keep VH fixed at 480)
        // Using Math.floor/ceil helps avoid sub-pixel rendering gaps
        VW = Math.ceil(VH * aspectRatio);

        // 2. Update Canvas Internal Resolution
        canvas.width = VW;
        canvas.height = VH;

        // 3. Update Canvas Display Size (CSS)
        // Force the canvas to match the viewport exactly
        canvas.style.width = `${windowWidth}px`;
        canvas.style.height = `${windowHeight}px`;

        // 4. Update Input Mapping
        inputManager.pointerDevice.setViewportSize(VW, VH);

        // 5. Update the Camera
        if (currentCamera && typeof currentCamera.setViewportSize === 'function') {
            currentCamera.setViewportSize(VW, VH);
        }

        // 6. Notify Scene
        if (currentScene && typeof currentScene.onResize === 'function') {
            currentScene.onResize(VW, VH);
        }
    };

    const switchScene = (scene, camera) => {
        if (currentScene) {
            currentScene.destroy();
        }
        currentScene = scene;
        currentCamera = camera;

        // Sync camera to current dynamic VW before starting
        if (currentCamera && currentCamera.setViewportSize) {
            currentCamera.setViewportSize(VW, VH);
        }

        scene.init();
        scene.start();
    };

    // Listen to both resize and visualViewport resize for better mobile support
    window.addEventListener("resize", handleResize);
    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", handleResize);
    }
    handleResize(); // Initial call to set size

    const ASSETS_URL = "assets/";

    // ── Load assets ───────────────────────────────────────────────────────────
    const ASSET_PATHS = {
        wallpaper: "wallpaper.png",
        player: "playership.png",
        enemy: "enemyship.png",
        drone: "drone.png",
        laser: "lasers.png",
        explosion: "explosion.png",
        teleport: "teleport.png",
    };

    for(let k in ASSET_PATHS) {
        ASSET_PATHS[k] = ASSETS_URL + ASSET_PATHS[k];
    }

    // Build spritesheets from loaded images
    const buildSheets = (images) => ({
        player: new Spritesheet({
            image: images.player,
            spriteWidth: 256, spriteHeight: 256,
            columns: 4, spriteCount: 16
        }),
        enemy: new Spritesheet({
            image: images.enemy,
            spriteWidth: 256, spriteHeight: 256,
            columns: 4, spriteCount: 16
        }),
        drone: new Spritesheet({
            image: images.drone,
            spriteWidth: 256, spriteHeight: 256,
            columns: 4, spriteCount: 16
        }),
        laser: new Spritesheet({
            image: images.laser,
            spriteWidth: 256, spriteHeight: 256,
            columns: 4, spriteCount: 16
        }),
        explosion: new Spritesheet({
            image: images.explosion,
            spriteWidth: 256, spriteHeight: 256,
            columns: 4, spriteCount: 16
        }),
        teleport: new Spritesheet({
            image: images.teleport,
            spriteWidth: 256, spriteHeight: 256,
            columns: 4, spriteCount: 24   // 4×6 = 24 frames
        }),
    });

    // ── Level management ──────────────────────────────────────────────────────
    const TOTAL_LEVELS = 3;
    let levelIndex = 0;
    let sheets = null;

    const startLevel = (idx) => {
        levelIndex = idx;
        const lscene = new LevelScene({
            levelIndex: idx,
            totalLevels: TOTAL_LEVELS,
            vw: VW,
            vh: VH,
            canvas,
            inputManager,
            sheets,
            onNextLevel: () => {
                if (levelIndex + 1 < TOTAL_LEVELS) {
                    startLevel(levelIndex + 1);
                } else {
                    showVictory();
                }
            },
            onGameOver: () => startLevel(0)
        });
        switchScene(lscene, lscene.camera);
    };

    const showVictory = () => {
        // Restart from level 0 after short delay
        setTimeout(() => startLevel(0), 3000);
    };

    // ── Loading scene ─────────────────────────────────────────────────────────
    // Use a simple camera for loading scene (no movement needed)
    const loadingCamera = new Camera(VW, VH);
    loadingCamera.position.set(0, 0);

    let loadingScene;

    const wallpaperImage = await assets.loadImage(ASSET_PATHS.wallpaper);

    // Start loading immediately, show loading screen meanwhile
    const loadPromise = Promise.all(
        Object.entries(ASSET_PATHS).map(([k, v]) => assets.loadImage(v).then(img => [k, img]))
    ).then(entries => {
        const images = Object.fromEntries(entries);
        sheets = buildSheets(images);
        return images;
    });

    loadingScene = new LoadingScene({
        canvas,
        vw: VW,
        vh: VH,
        wallpaperImage,
        onStart: () => startLevel(0)
    });

    switchScene(loadingScene, loadingCamera);

    loadPromise.then(() => {
        loadingScene.setLoaded();
    }).catch(err => {
        console.warn("Asset load error (using fallback):", err);
        loadingScene.setLoaded();
    });

    // ── Game loop ─────────────────────────────────────────────────────────────
    let lastRAF = 0;

    const loop = () => {
        requestAnimationFrame((now) => {
            loop();
            now *= 0.001;
            const dt = Math.min(now - (lastRAF || now), 0.05); // cap at 50ms
            lastRAF = now;

            if (currentScene && currentCamera) {
                currentScene.update(dt);
                renderer.render(currentScene, currentCamera);
            }
        });
    };

    loop();
};

main();
