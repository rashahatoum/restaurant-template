// Menu data access. Today it reads mock data; later these bodies switch to
// fetch() with the same signatures, so callers don't change. Async on purpose.

import { categories, products } from "@/data/mock/menu";
import type { Category, MenuSection, Product } from "@/types/menu";

export async function getCategories(): Promise<readonly Category[]> {
    return [...categories].sort((a, b) => a.order - b.order);
}

/** Categories in display order, each with its products (unavailable ones included). */
export async function getMenu(): Promise<readonly MenuSection[]> {
    const sortedCategories = await getCategories();

    return sortedCategories.map((category) => ({
        category,
        products: products.filter(
            (product) => product.categoryId === category.id
        ),
    }));
}

export async function getBestSellers(): Promise<readonly Product[]> {
    return products.filter(
        (product) => product.isBestSeller && product.isAvailable
    );
}
