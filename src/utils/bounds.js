export const bounds = {
    overlaps(a, b) {
        return !(a.max.x < b.min.x || a.min.x > b.max.x ||
                 a.max.y < b.min.y || a.min.y > b.max.y);
    },
    containsPoint(rect, point) {
        return point.x >= rect.min.x && point.x <= rect.max.x &&
               point.y >= rect.min.y && point.y <= rect.max.y;
    }
};
