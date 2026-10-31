// Builds a turning 3D spit from one front photo (browser only; three is
// passed in so callers load it with import()). The outline (a lathe) comes
// from the photo's transparency and the photo is wrapped around it.

import type * as THREE from "three";

/** Columns all the way round; 4 slices of 90°, so 512 per slice keeps the photo's detail. */
const TEXTURE_WIDTH = 2048;
const LATHE_SEGMENTS = 120;
const PROFILE_SMOOTHING = 2;
/** Half of the front slice the texture is taken from; the slice repeats 4 times around. */
const SLICE_HALF_ANGLE = 45;
/** Where two slices meet, each blends into the other over this many degrees (hides the joint). */
const SLICE_BLEND = 15;
/** The shape is drawn a little wider, then clipped to the photo's real (ragged) outline. */
const SHAPE_OVERSIZE = 1.05;
/** Brightness bins across the spit's width, for measuring the photo's built-in shading. */
const FALLOFF_BINS = 24;
/** Most a texel may be brightened when removing that shading. */
const MAX_LIFT = 2.2;
const FIRE_INTENSITY = 1.2;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

interface SpitProfile {
    width: number;
    height: number;
    /** First and last rows with anything opaque (the whole spit, pole included). */
    top: number;
    bottom: number;
    /** Horizontal position of the axis, in source pixels. */
    center: number;
    /** Radius of the silhouette for every row from top to bottom. */
    radii: Float32Array;
}

export interface SpitScene {
    canvas: HTMLCanvasElement;
    /** Draws the spit turned by `angle` degrees. */
    render: (angle: number) => void;
    /** Matches the drawing buffer to the canvas's CSS size. */
    resize: (width: number, height: number) => void;
    setFireLight: (on: boolean) => void;
    dispose: () => void;
}

function readPixels(img: HTMLImageElement) {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/** Reads the outline of the whole spit (meat and pole) from the photo's transparency. */
function measureProfile(pixels: ImageData): SpitProfile {
    const { width, height, data } = pixels;
    const halfWidths = new Float32Array(height);
    let top = -1;
    let bottom = -1;
    let centerSum = 0;
    let centerRows = 0;

    for (let y = 0; y < height; y++) {
        let left = -1;
        let right = -1;
        for (let x = 0; x < width; x++) {
            if (data[(y * width + x) * 4 + 3] > 128) {
                if (left < 0) left = x;
                right = x;
            }
        }
        if (left < 0) continue;

        if (top < 0) top = y;
        bottom = y;
        halfWidths[y] = (right - left + 1) / 2;
        centerSum += (left + right) / 2;
        centerRows++;
    }

    if (top < 0) throw new Error("The spit photo has no opaque pixels");

    const radii = new Float32Array(bottom - top + 1);
    for (let y = top; y <= bottom; y++) {
        let sum = 0;
        let count = 0;
        for (let k = -PROFILE_SMOOTHING; k <= PROFILE_SMOOTHING; k++) {
            const row = y + k;
            if (row < top || row > bottom) continue;
            sum += halfWidths[row];
            count++;
        }
        radii[y - top] = sum / count;
    }

    return { width, height, top, bottom, center: centerSum / centerRows, radii };
}

/**
 * The photo is darker toward the spit's sides (its own lighting). Measured
 * as average brightness by distance from the axis, so the texture can be
 * evened out: otherwise those dark sides turn with the meat and sweep across
 * the front. The 3D lights then do the shading, and stay put.
 */
function measureFalloff(pixels: ImageData, profile: SpitProfile) {
    const { width, data } = pixels;
    const sums = new Float64Array(FALLOFF_BINS);
    const counts = new Uint32Array(FALLOFF_BINS);
    const maxRadius = Math.max(...profile.radii);

    profile.radii.forEach((radius, row) => {
        if (radius < maxRadius * 0.5) return; // pole and flange: not meat
        const y = profile.top + row;
        for (let x = Math.ceil(profile.center - radius); x <= profile.center + radius; x++) {
            const i = (y * width + x) * 4;
            if (data[i + 3] < 200) continue;
            const bin = Math.min(FALLOFF_BINS - 1, Math.floor((Math.abs(x - profile.center) / radius) * FALLOFF_BINS));
            sums[bin] += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
            counts[bin]++;
        }
    });

    const brightness = Array.from(sums, (sum, bin) => (counts[bin] ? sum / counts[bin] : 0));
    const middle = brightness[0] || 1;
    /** Multiplier that lifts a texel taken at |sin| = s back to the middle's brightness. */
    return (s: number) => {
        const value = brightness[Math.min(FALLOFF_BINS - 1, Math.floor(s * FALLOFF_BINS))];
        return value ? Math.min(MAX_LIFT, middle / value) : 1;
    };
}

/**
 * Wraps the photo around the spit. The front slice (±45°) is the photo as
 * taken, repeated 4 times around (not mirrored: mirroring looks like a
 * kaleidoscope); where slices meet they cross-fade. Alpha is kept, so holes
 * in the photo (the pole's eye) stay holes.
 */
function buildTexture(pixels: ImageData, profile: SpitProfile) {
    const { width, data } = pixels;
    const rows = profile.bottom - profile.top + 1;
    const output = new ImageData(TEXTURE_WIDTH, rows);
    const out = output.data;
    const period = SLICE_HALF_ANGLE * 2;
    const lift = measureFalloff(pixels, profile);

    // Per column: two photo offsets (as sines) and how much of the second to mix in.
    const sinA = new Float32Array(TEXTURE_WIDTH);
    const sinB = new Float32Array(TEXTURE_WIDTH);
    const mix = new Float32Array(TEXTURE_WIDTH);

    for (let u = 0; u < TEXTURE_WIDTH; u++) {
        const theta = (u / TEXTURE_WIDTH) * 360;
        const offset = ((theta + SLICE_HALF_ANGLE) % period) - SLICE_HALF_ANGLE;
        const toEnd = SLICE_HALF_ANGLE - Math.abs(offset);
        const neighbour = offset > 0 ? offset - period : offset + period;

        sinA[u] = Math.sin(toRadians(offset));
        sinB[u] = Math.sin(toRadians(neighbour));
        mix[u] = toEnd < SLICE_BLEND ? 0.5 * (1 - toEnd / SLICE_BLEND) : 0;
    }

    const at = (y: number, x: number) => (y * width + Math.min(width - 1, Math.max(0, Math.round(x)))) * 4;

    for (let row = 0; row < rows; row++) {
        const y = profile.top + row;
        const radius = profile.radii[row];
        for (let u = 0; u < TEXTURE_WIDTH; u++) {
            const a = at(y, profile.center + radius * sinA[u]);
            const b = at(y, profile.center + radius * sinB[u]);
            const w = mix[u];
            const liftA = lift(Math.abs(sinA[u]));
            const liftB = lift(Math.abs(sinB[u]));
            const dst = (row * TEXTURE_WIDTH + u) * 4;
            for (let c = 0; c < 3; c++) {
                out[dst + c] = Math.min(255, data[a + c] * liftA * (1 - w) + data[b + c] * liftB * w);
            }
            out[dst + 3] = data[a + 3] * (1 - w) + data[b + 3] * w;
        }
    }

    const canvas = document.createElement("canvas");
    canvas.width = TEXTURE_WIDTH;
    canvas.height = rows;
    canvas.getContext("2d")!.putImageData(output, 0, 0);
    return canvas;
}

/**
 * Builds the scene. The returned canvas shows the photo's area exactly (an
 * orthographic camera in photo pixels), so give it the photo's aspect ratio;
 * it is clipped to the photo's outline with a CSS mask of `maskSrc`.
 */
export function createSpitScene(three: typeof THREE, img: HTMLImageElement, maskSrc: string): SpitScene {
    const pixels = readPixels(img);
    const profile = measureProfile(pixels);
    const { width, height, top } = profile;

    const renderer = new three.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = three.SRGBColorSpace;

    const canvas = renderer.domElement;
    // Clip to the photo's real outline: the lathe is perfectly smooth, the meat isn't.
    const mask = `url("${maskSrc}") center / contain no-repeat`;
    canvas.style.mask = mask;
    canvas.style.webkitMask = mask;

    const camera = new three.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -2000, 2000);
    camera.position.z = 1000;

    // Lathe points run bottom → top.
    const points: THREE.Vector2[] = [];
    for (let row = profile.radii.length - 1; row >= 0; row--) {
        points.push(new three.Vector2(profile.radii[row] * SHAPE_OVERSIZE, height / 2 - (top + row)));
    }

    const texture = new three.CanvasTexture(buildTexture(pixels, profile));
    texture.colorSpace = three.SRGBColorSpace;
    texture.wrapS = three.RepeatWrapping;
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const mesh = new three.Mesh(
        new three.LatheGeometry(points, LATHE_SEGMENTS),
        new three.MeshLambertMaterial({ map: texture, alphaTest: 0.5 })
    );
    mesh.position.x = profile.center - width / 2;

    // Fixed lights do the shading (the photo's own was evened out): a warm key
    // slightly from the front-right darkens the sides, so it reads round.
    const key = new three.DirectionalLight(0xfff1e0, 1.25);
    key.position.set(0.35, 0.25, 1);
    const fire = new three.DirectionalLight(0xff7a1a, FIRE_INTENSITY);
    fire.position.set(-1, -0.1, 0.25);

    const scene = new three.Scene();
    scene.add(mesh, new three.AmbientLight(0xffffff, 0.45), key, fire);

    return {
        canvas,
        render: (angle) => {
            mesh.rotation.y = toRadians(angle);
            renderer.render(scene, camera);
        },
        resize: (w, h) => renderer.setSize(w, h, false),
        setFireLight: (on) => {
            fire.intensity = on ? FIRE_INTENSITY : 0;
        },
        dispose: () => {
            mesh.geometry.dispose();
            texture.dispose();
            mesh.material.dispose();
            renderer.dispose();
            canvas.remove();
        },
    };
}
