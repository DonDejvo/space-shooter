import { SceneNode } from "../core/SceneNode.js";

export class PointerControl extends SceneNode {

    constructor(pointerDevice, params = {}) {
        super(params);

        this.pointerDevice = pointerDevice;
        this.priority = params.priority || 0;

        this.identifier = null;
    }

    start() {
        this.pointerDevice.registerControl(this);
    }

    destroy() {
        super.destroy();
        this.pointerDevice.unregisterControl(this);
    }

    _handlePointer(eventType, id, pos) {

        if (eventType === "start") {
            if (this.identifier !== null) return false;

            const claimed = this.onPointerStart(id, pos);
            if (claimed) {
                this.identifier = id;
            }
            return claimed;
        }

        if (id !== this.identifier) return false;

        if (eventType === "change") {
            this.onPointerMove(id, pos);
        }

        if (eventType === "end") {
            this.onPointerEnd(id);
            this.identifier = null;
        }

        return true;
    }

    onPointerStart(id, pos) { return false; }
    onPointerMove(id, pos) { }
    onPointerEnd(id) { }

    emit(event, value) {
        this.pointerDevice.emitDeviceEvent({
            control: this.name,
            event: event,
            value: value
        });
    }
}