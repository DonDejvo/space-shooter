import { InputDevice } from "./InputDevice.js"

export class KeyboardDevice extends InputDevice {
    constructor(manager) {
        super(manager, "Keyboard");

        this.onKeyDown = new Set();
        this.onKeyUp = new Set();

        addEventListener("keydown", e => {
            if (e.repeat) return;

            this.emitDeviceEvent({
                control: e.code,
                event: "start",
                value: 1
            });

            for(let control of this.controls) {
                control._handleKey(e.code, true);
            }
        });

        addEventListener("keyup", e => {
            this.emitDeviceEvent({
                control: e.code,
                event: "end"
            });

            for(let control of this.controls) {
                control._handleKey(e.code, false);
            }
        });
    }
}