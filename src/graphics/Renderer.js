import { bounds } from "../utils/bounds.js";

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.clearColor = "#000814";
        this.initialized = false;
    }

    setSize(w, h) { this.canvas.width = w; this.canvas.height = h; }
    getCanvas() { return this.canvas; }

    init() {
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        this.initialized = true;
    }

    render(scene, camera) {
        if (!this.initialized) throw new Error("Renderer not initialized.");
        camera.computeMatrix(this.canvas.width, this.canvas.height);
        const camBounds = camera.getBounds();

        this.ctx.resetTransform();
        this.ctx.fillStyle = this.clearColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (const layer of scene.getLayersOrdered()) {
            for (const drawable of layer.getDrawablesOrdered()) {
                if (!drawable.isScreenSpace && !bounds.overlaps(camBounds, drawable.getBounds())) continue;
                if (drawable.needsUpdate) drawable.computeMatrix();
                drawable.render(this, camera);
            }
        }
    }
}
