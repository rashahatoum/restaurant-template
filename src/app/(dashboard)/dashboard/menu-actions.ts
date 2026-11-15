"use server";

// The dashboard's menu writes with the Laravel API (D7c): categories,
// products and best sellers. Called by lib/dashboard/api-repository only.
// Every action is a public endpoint: it sends the signed-in user's token
// (Laravel checks it), and inputs are checked before they reach a URL.
//
// After a successful save: updateTag refreshes the public menu (the owner sees
// her change on the site right away), refresh() re-renders the dashboard page
// with fresh data from the admin GETs. Photos: upload-actions.

import type { Result } from "@/lib/api/errors";
import { adminWrite, badRequest, isDirection, segment, type Direction } from "@/lib/dashboard/action-helpers";
import type { ProductQuickChanges } from "@/lib/dashboard/validation";
import { MENU_TAG } from "@/services/menu";
import type { ProductInput } from "@/types/dashboard";
import type { Category, Product } from "@/types/menu";

const menuWrite = <T>(path: string, init: Parameters<typeof adminWrite>[2]) => adminWrite<T>(MENU_TAG, path, init);

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

/** `slug`: the optional «رابط» (API-CONTRACT §2); missing → the API gives a neutral id. */
export async function createCategoryAction(name: string, slug?: string): Promise<Result<Category>> {
    if (typeof name !== "string" || (slug !== undefined && typeof slug !== "string")) return badRequest();
    return menuWrite("/admin/categories", { method: "POST", body: { name, ...(slug ? { slug } : {}) } });
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
