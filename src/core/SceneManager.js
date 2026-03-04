export class SceneManager {

    constructor() {
        /** @type {Map<string, (params?: object) => Scene>} */
        this._registry = new Map();

        /** @type {Scene | null} */
        this._current = null;
    }

    define(name, factory) {
        this._registry.set(name, factory);
        return this; // allow chaining
    }

    switchScene(name, params = {}) {
        if (!this._registry.has(name)) {
            throw new Error(`SceneManager: unknown scene "${name}"`);
        }

        if (this._current) {
            this._current.destroy();
        }

        const scene = this._registry.get(name)(params);
        scene.init();
        scene.start();
        this._current = scene;
    }

    update(dt) {
        if (this._current) {
            this._current.update(dt);
        }
    }

    get currentScene() {
        return this._current;
    }
}