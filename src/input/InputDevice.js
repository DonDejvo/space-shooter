export class InputDevice {

    constructor(manager, name) {
        this.manager = manager;
        this.name = name;
    }

    emitDeviceEvent({ control, event, value, data }) {
        this.manager.handleDeviceEvent({ device: this.name, control, event, value, data });
    }
}