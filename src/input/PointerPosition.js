import { Vector } from "../utils/Vector.js";
import { PointerControl } from "./PointerControl.js";

export class PointerPosition extends PointerControl {

    constructor(pointerDevice, params = {}) {
        super(pointerDevice, params);

        this.posVector = new Vector(0, 0);
    }

    onPointerStart(id, pos) {
        this.posVector.copy(pos);
        this.emit("start", this.posVector);
        this.emit("change", this.posVector);
        return true;
    }

    onPointerMove(id, pos) {
        this.posVector.copy(pos);
        this.emit("change", this.posVector);
    }

    onPointerEnd() {
        this.emit("end");
    }
}