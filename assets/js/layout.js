export const TYPE_POSE = {
    burger: { name: 'Burger', rx: 0.42, ry: 0.35, z: 0.06 },
    pizza: { name: 'Pizza', rx: 0.95, ry: 0.18, z: 0.08 },
    pasta: { name: 'Pasta', rx: 0.42, ry: -0.28, z: 0.06 },
    friedplatter: { name: 'Fried Platter', rx: 0.95, ry: 0.2, z: 0.07 },
    friedPlatter: { name: 'Fried Platter', rx: 0.95, ry: 0.2, z: 0.07 },
    kebab: { name: 'Kebab', rx: 0.55, ry: 0.25, z: 0.06 },
    roast: { name: 'Roast', rx: 0.9, ry: 0.15, z: 0.07 },
    coffeeset: { name: 'Coffee Set', rx: 0.55, ry: 0.2, z: 0.06 },
    coffee: { name: 'Coffee', rx: 0.55, ry: 0.2, z: 0.06 },
    smoothie: { name: 'Smoothie', rx: 0.35, ry: 0.15, z: 0.08 },
    icedcoffee: { name: 'Iced Coffee', rx: 0.35, ry: -0.15, z: 0.08 },
    icedCoffee: { name: 'Iced Coffee', rx: 0.35, ry: -0.15, z: 0.08 },
    friedchicken: { name: 'Fried Chicken', rx: 0.85, ry: 0.2, z: 0.07 },
    friedChicken: { name: 'Fried Chicken', rx: 0.85, ry: 0.2, z: 0.07 },
    salmonsalad: { name: 'Salmon Salad', rx: 0.9, ry: 0.18, z: 0.07 },
    salad: { name: 'Salad', rx: 0.9, ry: 0.18, z: 0.07 },
    skewers: { name: 'Skewers', rx: 0.7, ry: 0.2, z: 0.06 },
    juice: { name: 'Juice', rx: 0.35, ry: 0.15, z: 0.08 },
    wrap: { name: 'Wrap', rx: 0.75, ry: 0.25, z: 0.06 }
};

export const DISH_OPTIONS = [
    { value: 'ignore', label: 'Ignore' },
    { value: 'burger', label: 'Burger' },
    { value: 'pizza', label: 'Pizza' },
    { value: 'pasta', label: 'Pasta' },
    { value: 'friedchicken', label: 'Fried Chicken' },
    { value: 'salmonsalad', label: 'Salmon Salad' },
    { value: 'skewers', label: 'Skewers' },
    { value: 'juice', label: 'Juice' },
    { value: 'wrap', label: 'Wrap' },
    { value: 'friedplatter', label: 'Fried Platter' },
    { value: 'kebab', label: 'Kebab' },
    { value: 'roast', label: 'Roast' },
    { value: 'coffeeset', label: 'Coffee Set' },
    { value: 'smoothie', label: 'Smoothie' },
    { value: 'icedcoffee', label: 'Iced Coffee' },
    { value: 'salad', label: 'Salad' },
    { value: 'coffee', label: 'Coffee' }
];

export function toArCoords(nx, ny, imageWidth, imageHeight) {
    const aspect = imageHeight / Math.max(1, imageWidth);
    return {
        x: nx - 0.5,
        y: (0.5 - ny) * aspect
    };
}

export function scaleFromRadius(radius) {
    return Math.max(0.18, Math.min(0.42, radius * 2.15));
}

function isPhotoPixel(r, g, b) {
    const maxc = Math.max(r, g, b);
    const minc = Math.min(r, g, b);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const sat = maxc === 0 ? 0 : (maxc - minc) / maxc;
    const yellow = r > 170 && g > 110 && b < 90 && lum > 100;
    const dark = lum < 32;
    const paper = lum > 225 && sat < 0.12;
    return !dark && !yellow && !paper && (sat > 0.16 || (lum > 45 && lum < 210));
}

function mergeBlobs(blobs) {
    const kept = [];
    blobs.forEach((blob) => {
        let merged = false;
        for (let i = 0; i < kept.length; i += 1) {
            const other = kept[i];
            const dist = Math.hypot(blob.nx - other.nx, blob.ny - other.ny);
            if (dist < (blob.radius + other.radius) * 0.75) {
                if (blob.radius > other.radius) kept[i] = blob;
                merged = true;
                break;
            }
        }
        if (!merged) kept.push(blob);
    });
    return kept;
}

export function detectPhotoRegions(img) {
    const maxW = 160;
    const scale = Math.min(1, maxW / img.naturalWidth);
    const w = Math.max(32, Math.round(img.naturalWidth * scale));
    const h = Math.max(32, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    const mask = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i += 1) {
        const o = i * 4;
        mask[i] = isPhotoPixel(data[o], data[o + 1], data[o + 2]) ? 1 : 0;
    }

    const seen = new Uint8Array(w * h);
    const blobs = [];
    const total = w * h;
    for (let i = 0; i < total; i += 1) {
        if (!mask[i] || seen[i]) continue;
        const queue = [i];
        seen[i] = 1;
        let minx = w;
        let miny = h;
        let maxx = 0;
        let maxy = 0;
        let sx = 0;
        let sy = 0;
        let n = 0;
        let qh = 0;
        while (qh < queue.length) {
            const p = queue[qh];
            qh += 1;
            const x = p % w;
            const y = (p / w) | 0;
            minx = Math.min(minx, x);
            maxx = Math.max(maxx, x);
            miny = Math.min(miny, y);
            maxy = Math.max(maxy, y);
            sx += x;
            sy += y;
            n += 1;
            const neighbors = [p + 1, p - 1, p + w, p - w];
            for (let k = 0; k < neighbors.length; k += 1) {
                const np = neighbors[k];
                if (np < 0 || np >= total) continue;
                if (neighbors[k] === p + 1 && x === w - 1) continue;
                if (neighbors[k] === p - 1 && x === 0) continue;
                if (!mask[np] || seen[np]) continue;
                seen[np] = 1;
                queue.push(np);
            }
        }
        const bw = maxx - minx + 1;
        const bh = maxy - miny + 1;
        const area = n / total;
        const aspect = bw / bh;
        if (area < 0.008 || area > 0.28) continue;
        if (aspect < 0.62 || aspect > 1.6) continue;
        blobs.push({
            nx: (sx / n) / w,
            ny: (sy / n) / h,
            radius: Math.max(bw / w, bh / h) * 0.52
        });
    }

    return mergeBlobs(blobs).sort((a, b) => a.ny - b.ny || a.nx - b.nx).slice(0, 8);
}

export function buildDishRecord(pin, imageWidth, imageHeight) {
    const ar = toArCoords(pin.nx, pin.ny, imageWidth, imageHeight);
    const pose = TYPE_POSE[pin.type] || TYPE_POSE.burger;
    const labeled = pin.type && pin.type !== 'ignore';
    return {
        id: pin.id,
        type: pin.type,
        name: pin.name || (labeled ? pose.name : 'Ignore'),
        x: ar.x,
        y: ar.y,
        z: labeled ? pose.z : 0,
        rx: labeled ? pose.rx : 0,
        ry: labeled ? pose.ry : 0,
        nx: pin.nx,
        ny: pin.ny,
        radius: pin.radius,
        scale: labeled ? (Number.isFinite(pin.scale) ? pin.scale : scaleFromRadius(pin.radius)) : 0.18
    };
}

export function guessType(index, total) {
    if (total === 3) return ['burger', 'pizza', 'pasta'][index] || 'ignore';
    if (total === 4) return 'ignore';
    if (total === 6) return ['friedplatter', 'kebab', 'roast', 'coffeeset', 'smoothie', 'icedcoffee'][index] || 'ignore';
    return 'ignore';
}
