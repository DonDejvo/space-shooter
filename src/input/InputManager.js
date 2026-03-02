import { InputAction } from "./InputAction.js";

export class InputManager {
    static _instance = null;

    static get() {
        if(this._instance === null) {
            this._instance = new InputManager();
        }
        return this._instance;
    }

    constructor() {
        this.actions = new Map();
        this.controlToBindings = new Map();
        this.controlStates = new Map();
    }

    addAction(name, type) {
        const a = new InputAction(name, type);
        this.actions.set(name, a);
        return a;
    }

    getAction(name) { return this.actions.get(name); }

    addBinding({ action, required, source }) {
        const binding = { action, required, source };
        const controls = [...required];
        if (source) controls.push(source);
        for (const c of controls) {
            const k = this._key(c);
            if (!this.controlToBindings.has(k)) this.controlToBindings.set(k, []);
            this.controlToBindings.get(k).push(binding);
        }
    }

    handleDeviceEvent({ device, control, event, value, data }) {
        const k = `${device}:${control}`;
        if (!this.controlStates.has(k)) this.controlStates.set(k, { pressed: false, value });
        const state = this.controlStates.get(k);
        if (event === "start") { state.pressed = true; state.value = value; }
        else if (event === "change") { state.value = value; }
        else if (event === "end") { state.pressed = false; }

        const bindings = this.controlToBindings.get(k);
        if (!bindings) return;
        for (const b of bindings) {
            const action = this.actions.get(b.action);
            if (!action) continue;
            if(data) action.data = { ...data };
            let allPressed = b.required.every(c => this.isPressed(c));
            if (b.source) allPressed = allPressed && this.isPressed(b.source);
            if (allPressed && b.source) {
                const ss = this.controlStates.get(this._key(b.source));
                if (ss) action.setValue(ss.value);
            }
            action.setPressed(allPressed);
        }
    }

    isPressed(control) {
        const s = this.controlStates.get(this._key(control));
        return s?.pressed === true;
    }

    _key(c) { return `${c.device}:${c.control}`; }
    getKey(c) { return this._key(c); }
}
