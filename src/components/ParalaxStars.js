import { Drawable } from "../graphics/Drawable.js";

export class ParalaxStars extends Drawable {
    constructor(params) {
        
        super({
            ...params,
            isStatic: true,
            isScreenSpace: true
        });

        this.starsCount = params.starsCount;
        this.minRadius = params.minRadius;
        this.maxRadius = params.maxRadius;
        this.paralaxFactor = params.paralaxFactor;

        this.stars = [];
        this.generateStars();
    }

    generateStars() {
        for (let i = 0; i < this.starsCount; ++i) {
            this.stars.push({
                relX: Math.random(),
                relY: Math.random(),
                radius: Math.random() * (this.maxRadius - this.minRadius) + this.minRadius
            });
        }
    }

    render(renderer, camera) {
        const { ctx } = renderer;

        ctx.setTransform(camera.projMatrix);

        ctx.fillStyle = "#e4fffb";
        ctx.beginPath();

        const { vw, vh, position } = camera;
        const camX = position.x;
        const camY = position.y;

        for (let i = 0; i < this.starsCount; i++) {
            const star = this.stars[i];
            const parallax = star.radius / this.paralaxFactor;

            let x = (star.relX * vw - camX * parallax);
            let y = (star.relY * vh - camY * parallax);

            x = ((x % vw) + vw) % vw;
            y = ((y % vh) + vh) % vh;

            ctx.moveTo(x + star.radius, y);
            ctx.arc(x, y, star.radius, 0, 2 * Math.PI);
        }

        ctx.fill();
    }
}