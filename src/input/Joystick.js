import { PointerControl } from "./PointerControl.js";
import { UICircleElement } from "../graphics/UICircleElement.js";
import { Vector } from "../utils/Vector.js";

export class Joystick extends PointerControl {

    constructor(pointerDevice, params = {}) {
        super(pointerDevice, params);

        this.radius = params.radius || 60;
        this.thumbRadius = params.thumbRadius || 30;
        this.deadzone = params.deadzone || 0.1;

        this.inputVector = new Vector(0, 0);

        this.baseUI = new UICircleElement({
            radius: this.radius,
            color: "rgba(255, 255, 255, 0.2)",
            zIndex: params.zIndex || 9999
        });

        this.thumbUI = new UICircleElement({
            radius: this.thumbRadius,
            color: "rgba(255, 255, 255, 0.8)",
            zIndex: (params.zIndex || 9999) + 1
        });
    }

    start() {
        super.start();
        this.addNode(this.baseUI);
        this.addNode(this.thumbUI);
    }

    onPointerStart(id, pos) {

        if (!this.baseUI.collides(pos))
            return false;

        this.updateInput(pos);

        this.emit("start", this.inputVector);
        this.emit("change", this.inputVector);

        return true;
    }

    onPointerMove(id, pos) {
        this.updateInput(pos);
        this.emit("change", this.inputVector);
    }

    onPointerEnd() {
        this.inputVector.set(0, 0);
        this.thumbUI.position.set(0, 0);

        this.emit("change", this.inputVector);
        this.emit("end");
    }

    updateInput(touchPos) {

        let offset = touchPos.clone().sub(this.worldPosition);
        let dist = offset.len();

        if (dist > this.radius) {
            offset.normalize().scale(this.radius);
            dist = this.radius;
        }

        this.thumbUI.position.copy(offset);

        let normDist = dist / this.radius;

        if (normDist < this.deadzone) {
            this.inputVector.set(0, 0);
        } else {
            let remapped = (normDist - this.deadzone) / (1 - this.deadzone);
            this.inputVector.copy(
                offset.clone().normalize().scale(remapped)
            );
        }
    }
}