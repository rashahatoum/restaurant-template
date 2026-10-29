// Menu data access. Today it reads mock data; later these bodies switch to
// fetch() with the same signatures, so callers don't change. Async on purpose.

import { categories, products } from "@/data/mock/menu";
import type { Category, MenuSection, Product } from "@/types/menu";

/** A product that has a photo (required where the image is the focus, e.g. best sellers). */
export type ProductWithImage = Product & { image: string };

export async function getCategories(): Promise<readonly Category[]> {
    return [...categories].sort((a, b) => a.order - b.order);
}

/**
 * Categories in display order, each with its products (unavailable ones
 * included, shown as such). Empty categories are left out.
 */
export async function getMenu(): Promise<readonly MenuSection[]> {
    const sortedCategories = await getCategories();

    return sortedCategories
        .map((category) => ({
            category,
            products: products.filter(
                (product) => product.categoryId === category.id
            ),
        }))
        .filter((section) => section.products.length > 0);
}

/** Available best sellers that have a photo (the slider shows the dish). */
export async function getBestSellers(): Promise<readonly ProductWithImage[]> {
    return products.filter(
        (product): product is ProductWithImage =>
            product.isBestSeller &&
            product.isAvailable &&
            Boolean(product.image)
    );
}
