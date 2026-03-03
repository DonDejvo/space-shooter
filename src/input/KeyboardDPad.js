import { SceneNode } from "../core/SceneNode.js";
import { Vector } from "../utils/Vector.js";

export class KeyboardDPad extends SceneNode {
    constructor(keyboardDevice, params = {}) {
        super();

        this.device = keyboardDevice;

        const {
            up = "KeyW",
            down = "KeyS",
            left = "KeyA",
            right = "KeyD"
        } = params;

        this.keyMap = {
            [up]: "up",
            [down]: "down",
            [left]: "left",
            [right]: "right"
        };

        this.vec = new Vector(0, 0);

        this.states = {
            up: false,
            down: false,
            left: false,
            right: false
        };
    }

    start() {
        this.device.registerControl(this);
    }

    destroy() {
        this.device.unregisterControl(this);
    }

    _handleKey(code, isDown) {
        const direction = this.keyMap[code];
        if (!direction) return;

        const wasMoving = this.vec.x !== 0 || this.vec.y !== 0;

        this.states[direction] = isDown;

        this.vec.x = (this.states.right ? 1 : 0) - (this.states.left ? 1 : 0);
        this.vec.y = (this.states.down ? 1 : 0) - (this.states.up ? 1 : 0);

        const isMoving = this.vec.x !== 0 || this.vec.y !== 0;

        if (!wasMoving && isMoving) {
            this.emit("start", this.vec);
        }

        this.emit("change", this.vec);

        if (wasMoving && !isMoving) {
            this.emit("end", this.vec);
        }
    }

    emit(event, value) {
        this.device.emitDeviceEvent({
            control: this.name,
            event: event,
            value: value
        });
    }
}