export class Scene {
    constructor() {
        this._nodes = [];
        this._pending = [];
        this._pendingRemove = [];
        this._layers = [];
        this._started = false;
        this.camera = null;
    }

    init(params = {}) { }

    findLayerByDrawable(drawable) {
        return this._layers.find(l => l.isStatic === drawable.isStatic && l.zIndex === drawable.zIndex);
    }

    addNode(node) {
        if (this._started) {
            this._pending.push(node);
        } else {
            this._nodes.push(node);
            node.scene = this;
        }
        return node;
    }

    removeNode(node) {
        const i = this._nodes.indexOf(node);
        if (i !== -1) {
            for (const child of [...node.getNodes()]) {
                this.removeNode(child);
            }
            node.destroy();
            node.scene = null;
            this._nodes.splice(i, 1);
        } else {
            const pi = this._pending.indexOf(node);
            if (pi !== -1) this._pending.splice(pi, 1);
        }
    }

    createLayer(params) {
        const layer = new SceneLayer(params);
        this._layers.push(layer);
        return layer;
    }

    getLayersOrdered() {
        return this._layers.sort((a, b) => a.zIndex - b.zIndex);
    }

    findNode(name) {
        for (const n of this._nodes) { if (n.name === name) return n; }
        return null;
    }

    start() {
        this._started = true;
        for (const n of [...this._nodes]) n.start();
    }

    update(dt) {
        while (this._pending.length > 0) {
            const n = this._pending.shift();
            this._nodes.push(n);
            n.scene = this;
            n.start();
        }
        for (const n of [...this._nodes]) n.update(dt);
    }

    destroy() {
        for (const n of [...this._nodes]) { n.destroy(); n.scene = null; }
        this._nodes = [];
        this._pending = [];
        this._layers = [];
        this._started = false;
    }

    onResize(vw, vh) { }
}

export class SceneLayer {
    constructor(params) {
        this.zIndex = params.zIndex;
        this.renderOrder = params.renderOrder || "manual";
        this.isStatic = params.isStatic;
        this._drawables = [];
    }

    addDrawable(d) { this._drawables.push(d); }

    removeDrawable(d) {
        const i = this._drawables.indexOf(d);
        if (i !== -1) this._drawables.splice(i, 1);
    }

    getDrawablesOrdered() {
        if (this.renderOrder === "topdown")
            return this._drawables.sort((a, b) => a.position.y - b.position.y);
        return this._drawables;
    }
}
