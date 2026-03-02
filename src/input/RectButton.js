import { UIRect } from "../graphics/UIRect.js";
import { bounds } from "../utils/bounds.js";
import { Vector } from "../utils/Vector.js";
import { Button } from "./Button.js";

export class RectButton extends Button {
    constructor(pointerDevice, params) {
        super(pointerDevice, new UIRect({
            width: params.width,
            height: params.height,
            color: params.color,
            text: params.text || "",
            fontSize: params.fontSize,
            isStatic: false,
            zIndex: params.zIndex || 9999
        }));

        this.width = params.width;
        this.height = params.height;
    }

    collides(pos) {
        const worldPos = this.worldPosition;
        const vec = new Vector(this.width / 2, this.height / 2);
        const rect = { min: worldPos.clone().sub(vec), max: worldPos.clone().add(vec) };
        
        return bounds.containsPoint(rect, pos);
    }
}