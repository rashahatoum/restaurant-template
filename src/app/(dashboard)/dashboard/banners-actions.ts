"use server";

// The dashboard's menu banner writes with the Laravel API (D7e). Called by
// lib/dashboard/api-repository only; same rules as menu-actions. Endpoints
// (API-CONTRACT §2, §4): a whole slide from the form → PUT (assumed, per §2;
// the contract's table lists PATCH), on/off → PATCH, move → POST …/move.

import type { Result } from "@/lib/api/errors";
import { adminWrite, badRequest, isDirection, isObject, segment, type Direction } from "@/lib/dashboard/action-helpers";
import { BANNERS_TAG } from "@/services/menu";
import type { MenuBanner } from "@/types/content";
import type { BannerInput } from "@/types/dashboard";

const bannersWrite = <T>(path: string, init: Parameters<typeof adminWrite>[2]) => adminWrite<T>(BANNERS_TAG, path, init);

export async function createBannerAction(input: BannerInput): Promise<Result<MenuBanner>> {
    if (!isObject(input)) return badRequest();
    return bannersWrite("/admin/banners", { method: "POST", body: input });
}

/** Whole slide from the form (PUT: a missing eyebrow or button is cleared). */
export async function saveBannerAction(id: string, input: BannerInput): Promise<Result<MenuBanner>> {
    const slug = segment(id);
    if (!slug || !isObject(input)) return badRequest();
    return bannersWrite(`/admin/banners/${slug}`, { method: "PUT", body: input });
}

export async function setBannerActiveAction(id: string, isActive: boolean): Promise<Result<MenuBanner>> {
    const slug = segment(id);
    if (!slug || typeof isActive !== "boolean") return badRequest();
    return bannersWrite(`/admin/banners/${slug}`, { method: "PATCH", body: { isActive } });
}

/** Returns the whole list in its new order (API-CONTRACT §4.2). */
export async function moveBannerAction(id: string, direction: Direction): Promise<Result<readonly MenuBanner[]>> {
    const slug = segment(id);
    if (!slug || !isDirection(direction)) return badRequest();
    return bannersWrite(`/admin/banners/${slug}/move`, { method: "POST", body: { direction } });
}

export async function deleteBannerAction(id: string): Promise<Result<null>> {
    const slug = segment(id);
    if (!slug) return badRequest();
    return bannersWrite(`/admin/banners/${slug}`, { method: "DELETE" });
}
