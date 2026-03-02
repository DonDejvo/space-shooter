import { InputDevice } from "./InputDevice.js"

export class KeyboardDevice extends InputDevice {
    constructor(manager) {
        super(manager, "Keyboard");

        this.onKeyDown = new Set();
        this.onKeyUp = new Set();

        window.addEventListener("keydown", e => {
            if (e.repeat) return;

            this.emitDeviceEvent({
                control: e.code,
                event: "start",
                value: 1
            });

            for (const callback of this.onKeyDown) callback(e.code);
        });

        window.addEventListener("keyup", e => {
            this.emitDeviceEvent({
                control: e.code,
                event: "end"
            });

            for (const callback of this.onKeyUp) callback(e.code);
        });
    }
}