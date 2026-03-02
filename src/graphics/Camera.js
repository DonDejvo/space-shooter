import { SceneNode } from "../core/SceneNode.js";
import { Vector } from "../utils/Vector.js";

export class Camera extends SceneNode {

    constructor(vw, vh) {
        super();

        this.vw = 0;
        this.vh = 0;

        this.viewMatrix = new DOMMatrix();
        this.projMatrix = new DOMMatrix();
        this.projViewMatrix = new DOMMatrix();

        this.setViewportSize(vw, vh);
    }

    setViewportSize(vw, vh) {
        this.vw = vw;
        this.vh = vh;
    }

    computeMatrix(canvasW, canvasH) {
        this.viewMatrix.e = -this.position.x;
        this.viewMatrix.f = -this.position.y;

        this.projMatrix.a = canvasW / this.vw;
        this.projMatrix.d = canvasH / this.vh;

        this.projViewMatrix.a = this.projMatrix.a;
        this.projViewMatrix.d = this.projMatrix.d;
        this.projViewMatrix.e = -this.position.x * this.projMatrix.a;
        this.projViewMatrix.f = -this.position.y * this.projMatrix.d;
    }

    getBounds() {
        return {
            min: this.position.clone(),
            max: this.position.clone().add(new Vector(this.vw, this.vh))
        };
    }
}