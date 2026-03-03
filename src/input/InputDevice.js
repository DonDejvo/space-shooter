export class InputDevice {

    constructor(manager, name) {
        this.manager = manager;
        this.name = name;

        this.controls = new Set();
    }

    registerControl(control) {
        this.controls.add(control);
    }

    unregisterControl(control) {
        this.controls.delete(control);
    }

    emitDeviceEvent({ control, event, value, data }) {
        this.manager.handleDeviceEvent({ device: this.name, control, event, value, data });
    }
}