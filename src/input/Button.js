import { PointerControl } from "./PointerControl.js";

export class Button extends PointerControl {

    constructor(pointerDevice, uiNode, params = {}) {
        super(pointerDevice, params);

        this.ui = uiNode;
        this.isPressed = false;
    }

    start() {
        super.start();
        this.addNode(this.ui);
    }

    collides(pos) {
        return false;
    }

    onPointerStart(id, pos) {

        if (!this.collides(pos)) return false;

        this.setPressed(true);
        this.emit("start", 1);

        return true;
    }

    onPointerEnd() {
        this.setPressed(false);
        this.emit("end", 0);
    }

    setPressed(pressed) {
        this.isPressed = pressed;

        if (pressed) {
            this.scale.set(0.9, 0.9);
        } else {
            this.scale.set(1.0, 1.0);
        }
    }
}