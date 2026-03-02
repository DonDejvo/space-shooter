export class Spritesheet {
    constructor(params) {
        this.image = params.image;
        this.spriteWidth = params.spriteWidth;
        this.spriteHeight = params.spriteHeight;
        this.columns = params.columns;
        this.spriteCount = params.spriteCount;
        this.spacing = params.spacing || 0;
        this.margin = params.margin || 0;
    }

    getSpriteXY(id) {
        return { x: id % this.columns, y: Math.floor(id / this.columns) };
    }
}
