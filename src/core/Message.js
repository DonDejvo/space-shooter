export class Message {
    constructor(type, value, propagate = true) {
        this.type = type;
        this.value = value;
        this._stopped = !propagate;
        this.node = null;
    }

    get isStopped() {
        return this._stopped;
    }

    stop() {
        this._stopped = true;
    }
}