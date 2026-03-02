export class Vector {
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }
    set(x, y) { this.x = x; this.y = y; return this; }
    copy(v) { this.x = v.x; this.y = v.y; return this; }
    clone() { return new Vector(this.x, this.y); }
    add(v) { this.x += v.x; this.y += v.y; return this; }
    sub(v) { this.x -= v.x; this.y -= v.y; return this; }
    scale(s) { this.x *= s; this.y *= s; return this; }
    mul(v) { this.x *= v.x; this.y *= v.y; return this; }
    div(s) { if (s !== 0) { this.x /= s; this.y /= s; } else { this.x = 0; this.y = 0; } return this; }
    static dot(v1, v2) { return v1.x * v2.x + v1.y * v2.y; }
    static cross(v1, v2) { return v1.x * v2.y - v1.y * v2.x; }
    len() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    lenSq() { return this.x * this.x + this.y * this.y; }
    normalize() { const l = this.len(); if (l > 0) this.div(l); return this; }
    project(v) {
        const vl = v.lenSq();
        if (vl === 0) return this.scale(0);
        return this.copy(v).scale(Vector.dot(this, v) / vl);
    }
    static distance(v1, v2) { const dx = v1.x - v2.x, dy = v1.y - v2.y; return Math.sqrt(dx * dx + dy * dy); }
    angle() { return Math.atan2(this.y, this.x); }
    rot(theta) {
        const c = Math.cos(theta), s = Math.sin(theta);
        const x = this.x * c - this.y * s, y = this.x * s + this.y * c;
        this.x = x; this.y = y; return this;
    }
    static fromAngle(angle, length = 1) { return new Vector(-Math.sin(angle) * length, Math.cos(angle) * length); }
    lerp(v, t) { this.x += (v.x - this.x) * t; this.y += (v.y - this.y) * t; return this; }
    toString() { return `Vector(${this.x}, ${this.y})`; }
    toArray() { return new Float32Array([this.x, this.y]); }
}
