import "server-only";

// The dashboard's starting data: every record as stored, nothing filtered.
// With API_BASE_URL set, categories and products come from the Laravel admin
// GETs (API-CONTRACT §4) and are saved there (D7c); everything else is still
// the mock data + the browser draft until the API has it.

import { about } from "@/data/mock/about";
import { hero } from "@/data/mock/hero";
import { menuBanners } from "@/data/mock/menu-banners";
import { categories, products } from "@/data/mock/menu";
import { offers } from "@/data/mock/offers";
import { ordering } from "@/data/mock/ordering";
import { reviews } from "@/data/mock/reviews";
import { siteInfo } from "@/data/mock/site-info";
import { apiFetch } from "@/lib/api/client";
import { isApiEnabled } from "@/lib/api/config";
import type { Result } from "@/lib/api/errors";
import { DASHBOARD_HOME, sessionExpiredHref } from "@/lib/auth/paths";
import { numberBestSellers } from "@/lib/menu";
import type { DashboardData } from "@/types/dashboard";
import type { Category, Product } from "@/types/menu";
import { redirect } from "next/navigation";

/** An admin GET's data, or leave the page: 401 → sign in again; anything else → the dashboard's error page. */
function dataOrLeave<T>(result: Result<T>, what: string): T {
    if (result.ok) return result.data;
    // A page can't delete the cookie: the route does (D7a)
    if (result.error.kind === "unauthenticated") redirect(sessionExpiredHref(DASHBOARD_HOME));
    throw new Error(`GET /admin/${what} failed (${result.error.kind}${result.error.status ? ` ${result.error.status}` : ""})`);
}

/** Categories (in order) and products as the API stores them; never cached (the dashboard edits them). */
async function menuFromApi(): Promise<Pick<DashboardData, "menuSource" | "categories" | "products">> {
    const [categoryResult, productResult] = await Promise.all([
        apiFetch<Category[]>("/admin/categories", { auth: true }),
        apiFetch<Product[]>("/admin/products", { auth: true }),
    ]);
    return {
        menuSource: "api",
        categories: [...dataOrLeave(categoryResult, "categories")].sort((a, b) => a.order - b.order),
        // The API keeps best sellers numbered 1…n already
        products: dataOrLeave(productResult, "products"),
    };
}

export async function getDashboardSeed(): Promise<DashboardData> {
    const menu = isApiEnabled()
        ? await menuFromApi()
        : {
              categories: [...categories].sort((a, b) => a.order - b.order),
              // Numbered, so moves and undo in the dashboard always have a place to work with
              products: numberBestSellers(products),
          };

    return {
        ...menu,
        offers,
        banners: menuBanners,
        reviews,
        hero,
        about,
        siteInfo,
        ordering,
    };
}
