import { SceneNode } from "../core/SceneNode.js";
import { Vector } from "../utils/Vector.js";

export class Drawable extends SceneNode {
    constructor(params) {
        super();
        this.zIndex = params.zIndex ?? 0;
        this.isStatic = params.isStatic ?? false;
        this.isScreenSpace = params.isScreenSpace ?? false;
        this.width = params.width ?? 0;
        this.height = params.height ?? 0;
        this.modelMatrix = new DOMMatrix();
        this.needsUpdate = true;
    }

    computeMatrix() {
        const pos = this.worldPosition;
        const angle = this.worldAngle;
        const scale = this.worldScale;
        const c = Math.cos(angle), s = Math.sin(angle);
        this.modelMatrix.a = scale.x * c;
        this.modelMatrix.b = scale.x * s;
        this.modelMatrix.c = scale.y * -s;
        this.modelMatrix.d = scale.y * c;
        this.modelMatrix.e = pos.x;
        this.modelMatrix.f = pos.y;
        if (this.isStatic) this.needsUpdate = false;
    }

    getMatrix() { return this.modelMatrix; }

    getBounds() {
        const ws = this.worldScale;
        const vec = new Vector(this.width / 2 * ws.x, this.height / 2 * ws.y);
        const min = this.worldPosition.clone().sub(vec);
        const max = min.clone().add(new Vector(this.width * ws.x, this.height * ws.y));
        return { min, max };
    }

    render(renderer, camera) {}

    start() {
        let layer = this.scene.findLayerByDrawable(this);
        if (!layer) layer = this.scene.createLayer({ zIndex: this.zIndex, isStatic: this.isStatic });
        layer.addDrawable(this);
    }

    destroy() {
        if (!this.scene) return;
        const layer = this.scene.findLayerByDrawable(this);
        if (layer) layer.removeDrawable(this);
    }
}
