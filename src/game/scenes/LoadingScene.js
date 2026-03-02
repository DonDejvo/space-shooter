import { Scene } from "../../core/Scene.js";
import { Drawable } from "../../graphics/Drawable.js";
import { Button } from "../../input/Button.js";
import { InputManager } from "../../input/InputManager.js";
import { bounds } from "../../utils/bounds.js";
import { Vector } from "../../utils/Vector.js";

class StartButtonDrawable extends Drawable {
    constructor(params) {
        super({ zIndex: 50, isStatic: false, isScreenSpace: true, width: params.width, height: params.height });
        this._hover = false;
    }

    render(renderer, camera) {
        const { ctx } = renderer;
        const final = camera.projMatrix.multiply(this.modelMatrix);
        ctx.setTransform(final);

        const bgColor = this.parent.loaded
            ? (this._hover ? "#55dd77" : "#44cc66")
            : "#888888";

        // Shadow
        ctx.shadowColor = "rgba(0,0,0,0.5)";
        ctx.shadowBlur = 12;
        ctx.fillStyle = bgColor;
        this._roundRect(ctx, -this.width / 2, -this.height / 2, this.width, this.height, 10);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Border
        ctx.strokeStyle = this.parent.loaded ? "#aaffcc" : "#aaaaaa";
        ctx.lineWidth = 2;
        this._roundRect(ctx, -this.width / 2, -this.height / 2, this.width, this.height, 10);
        ctx.stroke();

        // Text
        ctx.fillStyle = this.parent.loaded ? "#003311" : "#333333";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.parent.loaded ? "START" : "LOADING...", 0, 0);
    }

    _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    }
}

class StartButton extends Button {
    constructor(pointerDevice, onStart) {
        const w = 160;
        const h = 48;
        super(pointerDevice, new StartButtonDrawable({ width: w, height: h }));

        this.width = w;
        this.height = h;

        this.loaded = false;
        this.onClickRef = () => {
            if(this.loaded) onStart();
        }
    }

    start() {
        super.start();

        InputManager.get().getAction("game:start").onEnd.add(this.onClickRef);
    }

    destroy() {
        super.destroy();

        InputManager.get().getAction("game:start").onEnd.delete(this.onClickRef);
    }

    collides(pos) {
        const worldPos = this.worldPosition;
        const vec = new Vector(this.width / 2, this.height / 2);
        const rect = { min: worldPos.clone().sub(vec), max: worldPos.clone().add(vec) };

        return bounds.containsPoint(rect, pos);
    }
}

class FullscreenButtonDrawable extends Drawable {
    constructor(params) {
        super({ zIndex: 60, isStatic: true, isScreenSpace: true, width: 40, height: 40 });
        this.isFullscreen = false;   
    }

    render(renderer, camera) {
        const { ctx } = renderer;
        const final = camera.projMatrix.multiply(this.modelMatrix);
        ctx.setTransform(final);

        const s = 14; // Icon size factor
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";

        ctx.beginPath();
        if (!this.isFullscreen) {
            // "Enter Fullscreen" Icon (Corners pointing out)
            // Top Left
            ctx.moveTo(-s, -s + 6); ctx.lineTo(-s, -s); ctx.lineTo(-s + 6, -s);
            // Top Right
            ctx.moveTo(s - 6, -s); ctx.lineTo(s, -s); ctx.lineTo(s, -s + 6);
            // Bottom Left
            ctx.moveTo(-s, s - 6); ctx.lineTo(-s, s); ctx.lineTo(-s + 6, s);
            // Bottom Right
            ctx.moveTo(s - 6, s); ctx.lineTo(s, s); ctx.lineTo(s, s - 6);
        } else {
            // "Exit Fullscreen" Icon (Corners pointing in)
            // Top Left
            ctx.moveTo(-s + 6, -s); ctx.lineTo(-s + 6, -s + 6); ctx.lineTo(-s, -s + 6);
            // Top Right
            ctx.moveTo(s - 6, -s); ctx.lineTo(s - 6, -s + 6); ctx.lineTo(s, -s + 6);
            // Bottom Left
            ctx.moveTo(-s + 6, s); ctx.lineTo(-s + 6, s - 6); ctx.lineTo(-s, s - 6);
            // Bottom Right
            ctx.moveTo(s - 6, s); ctx.lineTo(s - 6, s - 6); ctx.lineTo(s, s - 6);
        }
        ctx.stroke();
    }
}

class FullscreenButton extends Button {
    constructor(pointerDevice) {
        const size = 44;
        const drawable = new FullscreenButtonDrawable();
        super(pointerDevice, drawable);
        this.width = size;
        this.height = size;

        // Sync icon state with actual document state
        document.addEventListener("fullscreenchange", () => {
            drawable.isFullscreen = !!document.fullscreenElement;
        });

        this.onClickRef = () => {
            this.toggle();
        }
    }

     start() {
        super.start();

        InputManager.get().getAction("game:fullscreen").onEnd.add(this.onClickRef);
    }

    destroy() {
        super.destroy();

        InputManager.get().getAction("game:fullscreen").onEnd.delete(this.onClickRef);
    }

    // Logic to toggle fullscreen
    toggle() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.warn(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

    collides(pos) {
        const worldPos = this.worldPosition;
        const vec = new Vector(this.width / 2, this.height / 2);
        const rect = { min: worldPos.clone().sub(vec), max: worldPos.clone().add(vec) };
        return bounds.containsPoint(rect, pos);
    }
}

// Simple fullscreen image drawable
class WallpaperDrawable extends Drawable {
    constructor(image) {
        super({ zIndex: -100, isStatic: true, isScreenSpace: true });
        this._image = image; // may be null initially
    }
    update() { this.needsUpdate = true; }
    render(renderer, camera) {
        const { ctx } = renderer;
        ctx.setTransform(camera.projMatrix);
        
        if (this._image) {
            ctx.drawImage(this._image, 0, 0, camera.vw, camera.vh);
        } else {
            // Placeholder gradient
            const grad = ctx.createLinearGradient(0, 0, 0, camera.vh);
            grad.addColorStop(0, "#000814");
            grad.addColorStop(1, "#001830");
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, camera.vw, camera.vh);
        }
    }
}

class OverlayText extends Drawable {
    constructor() {
        super({ zIndex: 40, isStatic: true, isScreenSpace: true });
    }
    update() { this.needsUpdate = true; }
    render(renderer, camera) {
        const { ctx } = renderer;
        ctx.setTransform(camera.projMatrix);
        ctx.fillStyle = "rgba(0, 10, 30, 0.55)";
        ctx.fillRect(0, 0, camera.vw, camera.vh);
        ctx.fillStyle = "#c8e8ff";
        ctx.font = "bold 42px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "#0055ff";
        ctx.shadowBlur = 20;
        ctx.fillText("SPACE SHOOTER", camera.vw / 2, camera.vh / 2 - 40);
        ctx.shadowBlur = 0;
        ctx.font = "16px Arial";
        ctx.fillStyle = "#889aaa";
        ctx.fillText("WASD / Left Joystick to move  •  Click / Right Touch to aim & shoot", camera.vw / 2, camera.vh / 2 + 10);
    }
}

export class LoadingScene extends Scene {
    constructor(params) {
        super();
        this._params = params; // { canvas, screenW, screenH, onStart }
    }

    init() {
        const { wallpaperImage, onStart, vw, vh } = this._params;
        const inputManager = InputManager.get();

        const wallpaper = new WallpaperDrawable(wallpaperImage, vw, vh);
        this.addNode(wallpaper);

        const overlay = new OverlayText(vw, vh);
        this.addNode(overlay);

        this._btn = new StartButton(inputManager.pointerDevice, onStart);
        this._btn.name = "StartBtn";
        this._btn.position.set(vw / 2, vh - 80);
        this.addNode(this._btn);

        this._fsBtn = new FullscreenButton(inputManager.pointerDevice);
        this._fsBtn.name = "FsBtn";
        this._fsBtn.position.set(50, 50);
        this.addNode(this._fsBtn);
    }

    setLoaded() {
        if (this._btn) this._btn.loaded = true;
    }

    onResize(vw, vh) {
        this._btn.position.set(vw / 2, vh - 80);
    }
}
