import { restaurantConfig } from "@/config/restaurant";

/* =========================
   SPIT SOURCE DATA
   Everything the rotation experiments need to know about the photos.
   Whichever approach wins moves these settings into the restaurant config.
========================= */

const { framesPath, filePrefix, fileExtension } = restaurantConfig.hero.media.animation;

// Every frame on disk, including 210–330 which the current hero doesn't use.
const FRAME_ANGLES = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 210, 240, 270, 300, 330];

export const spitFrames = FRAME_ANGLES.map((angle) => ({
    angle,
    src: `${framesPath}/${filePrefix}-${String(angle).padStart(3, "0")}.${fileExtension}`,
}));

export const spitImage = {
    width: 1024,
    height: 1536,
    // Rows (in source pixels) where the meat starts and ends.
    // Above and below are the rings, pole and drips, which stay static.
    meatTop: 204,
    meatBottom: 1288,
};

export const mod360 = (angle: number) => ((angle % 360) + 360) % 360;

/** Wraps an angle into [-180, 180). */
export const wrap180 = (angle: number) => mod360(angle + 180) - 180;

/** Finds the two frames surrounding `angle` and how far between them it sits (0..1). */
export function bracketFrames(angle: number) {
    const a = mod360(angle);
    const count = spitFrames.length;

    for (let i = 0; i < count; i++) {
        const from = spitFrames[i].angle;
        const to = i === count - 1 ? 360 : spitFrames[i + 1].angle;

        if (a >= from && a < to) {
            return { from: i, to: (i + 1) % count, t: (a - from) / (to - from) };
        }
    }

    return { from: 0, to: 1, t: 0 };
}

export function loadImage(src: string) {
    const img = new Image();
    img.src = src;
    return img.decode().then(() => img);
}
