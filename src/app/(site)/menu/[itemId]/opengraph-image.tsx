import { restaurantConfig } from "@/config/restaurant";
import { getMenuItem, getMenuItemIds } from "@/services/menu";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp, { type OverlayOptions } from "sharp";

// Link preview for one product or offer (WhatsApp, Facebook…): the dish on
// the brand's dark background with an orange glow, the logo beside it.
// Item photos are transparent WebP, which previews badly on their own.
// Built with sharp, not ImageResponse: its renderer can't draw WebP. JPG
// because WhatsApp previews it most reliably. No text: the name is in the
// preview's title. Generated at build time, one per item.

const W = 1200;
const H = 630;
const PADDING = 80;
const DISH = 560;
const LOGO = { width: 420, height: 140 };

export const size = { width: W, height: H };
export const contentType = "image/jpeg";
export const alt = `طبق من ${restaurantConfig.name}`;

export async function generateStaticParams() {
    const ids = await getMenuItemIds();
    return ids.map((itemId) => ({ itemId }));
}

/** A /public path, or a full URL (dashboard uploads later). */
async function loadImage(path: string): Promise<Buffer> {
    if (/^https?:\/\//.test(path)) return Buffer.from(await (await fetch(path)).arrayBuffer());
    return readFile(join(process.cwd(), "public", path));
}

/** Resized to fit the box; returns the buffer and its real size for centering. */
async function fit(input: Buffer, width: number, height: number) {
    const { data, info } = await sharp(input).resize({ width, height, fit: "inside" }).png().toBuffer({ resolveWithObject: true });
    return { data, width: info.width, height: info.height };
}

const logo = await fit(await loadImage(restaurantConfig.logo), LOGO.width, LOGO.height);

export default async function Image({ params }: { params: Promise<{ itemId: string }> }) {
    const item = await getMenuItem((await params).itemId);
    const { background, accent } = restaurantConfig.seo.shareColors;

    // Dish box centre (left half; RTL reading order puts the logo on the right)
    const dishX = PADDING + DISH / 2;
    const backdrop = Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
            <defs>
                <radialGradient id="glow" gradientUnits="userSpaceOnUse" cx="${dishX}" cy="${H * 0.55}" r="${DISH * 0.75}">
                    <stop offset="0" stop-color="${accent}" stop-opacity="0.45"/>
                    <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
                </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="${background}"/>
            <rect width="100%" height="100%" fill="url(#glow)"/>
        </svg>`
    );

    const layers: OverlayOptions[] = [
        {
            input: logo.data,
            left: W - PADDING - logo.width,
            top: Math.round((H - logo.height) / 2),
        },
    ];

    if (item?.image) {
        const dish = await fit(await loadImage(item.image), DISH, DISH);
        layers.push({
            input: dish.data,
            left: Math.round(dishX - dish.width / 2),
            top: Math.round((H - dish.height) / 2),
        });
    }

    const jpeg = await sharp(backdrop).composite(layers).jpeg({ quality: 82, mozjpeg: true }).toBuffer();

    return new Response(new Uint8Array(jpeg), { headers: { "Content-Type": contentType } });
}
