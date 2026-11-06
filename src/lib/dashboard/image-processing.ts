// Prepares a photo picked on the phone before it's stored or uploaded:
// resized, re-encoded (WebP when the browser can), and checked for a
// transparent background (a cut-out dish vs a full photo). Browser only.
// Runs before the repository, so the Laravel upload gets small files too.

import { appError, fail, ok, type Result } from "@/lib/api/errors";
import type { ImageStyle } from "@/types/menu";

/** Bigger files are refused before decoding (phone photos are usually 2–8 MB). */
const MAX_INPUT_BYTES = 15 * 1024 * 1024;

/** Share of see-through pixels above which the image counts as a cut-out. */
const TRANSPARENT_SHARE = 0.04;

export interface PreparedImage {
    blob: Blob;
    width: number;
    height: number;
    /** Detected: "cutout" when the background is transparent, else "photo". */
    suggestedStyle: ImageStyle;
}

const imageError = (message: string) => appError("validation", { message, fieldErrors: { image: [message] } });

/** Samples the alpha channel: enough clear pixels → a cut-out on a transparent background. */
function hasTransparency(context: CanvasRenderingContext2D, width: number, height: number): boolean {
    const { data } = context.getImageData(0, 0, width, height);
    const step = 4 * 7; // every 7th pixel is plenty
    let clear = 0;
    let total = 0;
    for (let index = 3; index < data.length; index += step) {
        total += 1;
        if (data[index] < 16) clear += 1;
    }
    return total > 0 && clear / total > TRANSPARENT_SHARE;
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** The file → a smaller image ready to store, or a validation error on `image`. */
export async function prepareImage(file: File, maxSide = 800): Promise<Result<PreparedImage>> {
    if (!file.type.startsWith("image/")) return fail(imageError("هاد الملف مش صورة. اختار صورة JPG أو PNG أو WebP."));
    if (file.size > MAX_INPUT_BYTES) return fail(appError("too_large", { fieldErrors: { image: ["الصورة كبيرة كتير (أكتر من 15MB)."] } }));

    let bitmap: ImageBitmap;
    try {
        // Applies the photo's EXIF rotation, so phone photos aren't sideways
        bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
        return fail(imageError("ما قدرنا نفتح الصورة. جرّب صورة تانية أو صيغة JPG."));
    }

    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return fail(imageError("المتصفح ما سمح بمعالجة الصورة."));

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const isCutout = hasTransparency(context, width, height);

    // WebP keeps transparency and is small; browsers that can't encode it
    // (older Safari) return PNG instead, so fall back on purpose
    let blob = await toBlob(canvas, "image/webp", 0.85);
    if (!blob || blob.type !== "image/webp") {
        blob = isCutout ? await toBlob(canvas, "image/png") : await toBlob(canvas, "image/jpeg", 0.85);
    }
    if (!blob) return fail(imageError("ما قدرنا نحفظ الصورة. جرّب مرة تانية."));

    return ok({ blob, width, height, suggestedStyle: isCutout ? "cutout" : "photo" });
}
