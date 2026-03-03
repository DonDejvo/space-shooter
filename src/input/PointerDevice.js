import { InputDevice } from "./InputDevice.js";
import { Vector } from "../utils/Vector.js";

export class PointerDevice extends InputDevice {

    constructor(manager, element) {
        super(manager, "Pointer");

        this.element = element;

        this.vw = 0;
        this.vh = 0;

        
        this.pointerOwners = new Map();

        element.addEventListener("pointerdown", e => this.handle(e, "start"));
        element.addEventListener("pointermove", e => this.handle(e, "change"));
        element.addEventListener("pointerup", e => this.handle(e, "end"));
        element.addEventListener("pointercancel", e => this.handle(e, "end"));

        element.style.touchAction = "none";
    }

    setViewportSize(vw, vh) {
        this.vw = vw;
        this.vh = vh;
    }

    unregisterControl(control) {
        super.unregisterControl(control);

        for (const [id, owner] of this.pointerOwners.entries()) {
            if (owner === control) {
                this.pointerOwners.delete(id);
            }
        }
    }

    handle(e, eventType) {

        const rect = this.element.getBoundingClientRect();

        const pos = new Vector(
            (e.clientX - rect.left) / rect.width * this.vw,
            (e.clientY - rect.top) / rect.height * this.vh
        );

        if (eventType === "start") {
            this.element.setPointerCapture(e.pointerId);
        }

        const owner = this.pointerOwners.get(e.pointerId);

        if (eventType !== "start") {
            if (owner) {
                owner._handlePointer(eventType, e.pointerId, pos);
                if (eventType === "end") {
                    this.pointerOwners.delete(e.pointerId);
                }
            }
            return;
        }

        const sorted = [...this.controls].sort((a, b) => b.priority - a.priority);

        for (const control of sorted) {
            const claimed = control._handlePointer("start", e.pointerId, pos);
            if (claimed) {
                this.pointerOwners.set(e.pointerId, control);
                break;
            }
        }
    }
}