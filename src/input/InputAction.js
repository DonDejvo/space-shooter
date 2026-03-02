import { Vector } from "../utils/Vector.js";

export class InputAction {
    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.onStart = new Set();
        this.onEnd = new Set();
        this.onChange = new Set();
        this.pressed = false;
        this.value = type === "vector" ? new Vector() : 0;
        this.data = {};
    }

    setPressed(state) {
        if (!state) {
            if (this.type === "vector") this.value.set(0, 0);
            else this.value = 0;
        }
        if (!this.pressed && state) {
            for (const cb of this.onStart) cb(this.value, this);
        } else if (this.pressed && !state) {
            for (const cb of this.onEnd) cb(this);
        } else if (state) {
            for (const cb of this.onChange) cb(this.value, this);
        }
        this.pressed = state;
    }

    setValue(v) { this.value = v; }
    getValue() { return this.value; }
}
