import { Vector } from "../utils/Vector.js";

export class SceneNode {
    static _nextId = 1;

    constructor() {
        this.position = new Vector();
        this.angle = 0;
        this.scale = new Vector(1, 1);
        this._id = SceneNode._nextId++;
        this._name = "";
        this._parent = null;
        this._nodes = [];
        this.scene = null;
    }

    addNode(node) {
        if (!this.scene) throw new Error("Cannot add node: not in scene");
        node.setParent(this, false);
        return this.scene.addNode(node);
    }

    removeNode(node) {
        if (!this.scene) throw new Error("Cannot remove node: not in scene");
        const i = this._nodes.indexOf(node);
        if (i !== -1) { this._nodes.splice(i, 1); this.scene.removeNode(node); }
    }

    getNodes(nodeClass) {
        return nodeClass ? this._nodes.filter(n => n instanceof nodeClass) : this._nodes;
    }

    getNodesFromParent(nodeClass) {
        return this._parent ? this._parent.getNodes(nodeClass) : [];
    }

    get name() { return this._name; }
    set name(v) { this._name = v; }
    get id() { return this._id; }
    get parent() { return this._parent; }

    get worldAngle() {
        return this._parent ? this._parent.worldAngle + this.angle : this.angle;
    }
    set worldAngle(angle) {
        this.angle = this._parent ? angle - this._parent.worldAngle : angle;
    }

    get worldPosition() {
        if (this._parent)
            return this._parent.worldPosition.clone().add(this.position.clone().rot(this._parent.worldAngle));
        return this.position.clone();
    }
    set worldPosition(pos) {
        if (this._parent) this.position.copy(pos.clone().sub(this._parent.worldPosition).rot(-this._parent.worldAngle));
        else this.position.copy(pos);
    }

    get worldScale() {
        return this._parent ? this._parent.worldScale.clone().mul(this.scale) : this.scale.clone();
    }

    setParent(newParent, worldPositionStays = true) {
        const curParent = this._parent;
        const curWorldPos = this.worldPosition;
        const curWorldAngle = this.worldAngle;
        this._parent = newParent;
        if (newParent) {
            if (worldPositionStays) {
                this.position.copy(curWorldPos.sub(newParent.worldPosition));
                this.angle = curWorldAngle - newParent.worldAngle;
            }
            newParent._nodes.push(this);
        } else if (curParent) {
            if (worldPositionStays) { this.position.copy(curWorldPos); this.angle = curWorldAngle; }
            const i = curParent._nodes.indexOf(this);
            if (i !== -1) curParent._nodes.splice(i, 1);
        }
    }

    start() {}
    update(dt) {}
    destroy() {}
}
