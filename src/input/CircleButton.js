import { UICircle } from "../graphics/UICircle.js";
import { Vector } from "../utils/Vector.js";
import { Button } from "./Button.js";

export class CircleButton extends Button {
    constructor(pointerDevice, params) {
        super(pointerDevice, new UICircle({
            radius: params.radius,
            color: params.color,
            text: params.text || "",
            fontSize: params.fontSize,
            isStatic: false,
            zIndex: params.zIndex || 9999
        }));

        this.radius = params.radius || 30;
    }

    collides(pos) {
        return Vector.distance(pos, this.worldPosition) <= this.radius;
    }
}