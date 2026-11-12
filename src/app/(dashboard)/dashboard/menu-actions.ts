"use server";

// The dashboard's menu writes with the Laravel API (D7c): categories,
// products, best sellers and their photos. Called by lib/dashboard/api-repository
// only. Every action is a public endpoint: it sends the signed-in user's token
// (Laravel checks it), and inputs are checked before they reach a URL.
//
// After a successful save: updateTag refreshes the public menu (the owner sees
// her change on the site right away), refresh() re-renders the dashboard page
// with fresh data from the admin GETs.

import { apiFetch } from "@/lib/api/client";
import { appError, fail, ok, type Result } from "@/lib/api/errors";
import type { ProductQuickChanges } from "@/lib/dashboard/validation";
import { MENU_TAG } from "@/services/menu";
import type { ProductInput } from "@/types/dashboard";
import type { Category, Product } from "@/types/menu";
import { refresh, updateTag } from "next/cache";

type Direction = "up" | "down";

const badRequest = <T>(): Result<T> => fail(appError("validation", { message: "طلب ناقص، حدّث الصفحة وجرّب مرة تانية" }));

/** A slug or id as one URL segment (never a path of its own). */
const segment = (id: unknown) => (typeof id === "string" && id.length > 0 ? encodeURIComponent(id) : null);

const isDirection = (value: unknown): value is Direction => value === "up" || value === "down";

/** Runs a menu write; on success refreshes the public menu and this page. A 204 becomes `null`. */
async function menuWrite<T>(path: string, init: Parameters<typeof apiFetch>[1]): Promise<Result<T>> {
    const result = await apiFetch<T>(path, { ...init, auth: true });
    if (!result.ok) return result;
    updateTag(MENU_TAG);
    refresh();
    return ok((result.data ?? null) as T);
}

/* =========================
   PRODUCTS AND BEST SELLERS
========================= */

/** Quick change from the list: price, availability, best seller (PATCH, API-CONTRACT §4). */
export async function updateProductAction(id: string, changes: ProductQuickChanges): Promise<Result<Product>> {
    const slug = segment(id);
    if (!slug || typeof changes !== "object" || changes === null) return badRequest();
    return menuWrite(`/admin/products/${slug}`, { method: "PATCH", body: changes });
}

export async function createProductAction(input: ProductInput): Promise<Result<Product>> {
    if (typeof input !== "object" || input === null) return badRequest();
    return menuWrite("/admin/products", { method: "POST", body: input });
}

/** Whole product from the form (PUT: a missing optional field is cleared). */
export async function saveProductAction(id: string, input: ProductInput): Promise<Result<Product>> {
    const slug = segment(id);
    if (!slug || typeof input !== "object" || input === null) return badRequest();
    return menuWrite(`/admin/products/${slug}`, { method: "PUT", body: input });
}

export async function deleteProductAction(id: string): Promise<Result<null>> {
    const slug = segment(id);
    if (!slug) return badRequest();
    return menuWrite(`/admin/products/${slug}`, { method: "DELETE" });
}

export async function moveBestSellerAction(id: string, direction: Direction): Promise<Result<readonly Product[]>> {
    const slug = segment(id);
    if (!slug || !isDirection(direction)) return badRequest();
    return menuWrite(`/admin/best-sellers/${slug}/move`, { method: "POST", body: { direction } });
}

/* =========================
   CATEGORIES
========================= */

export async function createCategoryAction(name: string): Promise<Result<Category>> {
    if (typeof name !== "string") return badRequest();
    return menuWrite("/admin/categories", { method: "POST", body: { name } });
}

export async function renameCategoryAction(id: string, name: string): Promise<Result<Category>> {
    const slug = segment(id);
    if (!slug || typeof name !== "string") return badRequest();
    return menuWrite(`/admin/categories/${slug}`, { method: "PATCH", body: { name } });
}

export async function moveCategoryAction(id: string, direction: Direction): Promise<Result<readonly Category[]>> {
    const slug = segment(id);
    if (!slug || !isDirection(direction)) return badRequest();
    return menuWrite(`/admin/categories/${slug}/move`, { method: "POST", body: { direction } });
}

/** Refused by the API (409, with its Arabic reason) while the category has products. */
export async function deleteCategoryAction(id: string): Promise<Result<null>> {
    const slug = segment(id);
    if (!slug) return badRequest();
    return menuWrite(`/admin/categories/${slug}`, { method: "DELETE" });
}

/** `image: null` removes the photo (PATCH, API-CONTRACT §2). */
export async function setCategoryImageAction(id: string, image: string | undefined): Promise<Result<Category>> {
    const slug = segment(id);
    if (!slug || (image !== undefined && typeof image !== "string")) return badRequest();
    return menuWrite(`/admin/categories/${slug}`, { method: "PATCH", body: { image: image ?? null } });
}

/* =========================
   PHOTOS
========================= */

interface UploadResponse {
    url: string;
    width: number;
    height: number;
}

/**
 * A prepared photo (FormData field `image`) → `POST /admin/uploads`. Changes
 * no record, so nothing to refresh: the form saves the returned URL later.
 */
export async function uploadMenuImageAction(formData: FormData): Promise<Result<{ src: string }>> {
    const image = formData.get("image");
    if (!(image instanceof File)) return badRequest();

    const body = new FormData();
    body.append("image", image);
    const result = await apiFetch<UploadResponse>("/admin/uploads", { method: "POST", body, auth: true });
    if (!result.ok) return result;
    return typeof result.data?.url === "string" ? ok({ src: result.data.url }) : fail(appError("server"));
}
