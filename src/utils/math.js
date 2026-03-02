const lerp = (a, b, t) => {
    return (b - a) * t + a;
}

const clamp = (v, a, b) => {
    return Math.min(Math.max(v, a), b);
}

export const math = {
    lerp
};