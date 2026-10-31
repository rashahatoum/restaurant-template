// Menu data access. Today it reads mock data; later these bodies switch to
// fetch() with the same signatures, so callers don't change. Async on purpose.

import { categories, products } from "@/data/mock/menu";
import { offerKey, productKey } from "@/lib/cart";
import { getSingleChoiceGroup } from "@/lib/menu";
import { getOffersContent } from "@/services/content";
import type { Category, MenuItemDetails, MenuSection, Product } from "@/types/menu";

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

/**
 * A product (shown in the menu) or an active offer, for its details page.
 * null when the id is unknown, the product's category is hidden, or the offer is off.
 */
export async function getMenuItem(id: string): Promise<MenuItemDetails | null> {
    const sections = await getMenu();
    const product = sections
        .flatMap((section) => section.products)
        .find((candidate) => candidate.id === id);

    if (product) {
        const sizeGroup = getSingleChoiceGroup(product);
        return {
            id: product.id,
            kind: "product",
            itemKey: productKey(product.id),
            name: product.name,
            description: product.description,
            image: product.image,
            price: product.price,
            parts: product.ingredients,
            badge: product.isBestSeller ? "الأكثر طلباً" : undefined,
            isAvailable: product.isAvailable,
            options: sizeGroup?.options,
            optionsLabel: sizeGroup?.name,
        };
    }

    const offer = (await getOffersContent())?.offers.find((candidate) => candidate.id === id);
    if (!offer) return null;

    return {
        id: offer.id,
        kind: "offer",
        itemKey: offerKey(offer.id),
        name: offer.title,
        image: offer.image,
        price: offer.price,
        parts: offer.items,
        freeItem: offer.freeItem,
        badge: offer.badge,
        isAvailable: true,
    };
}

/** Every id that has a details page (for static generation). */
export async function getMenuItemIds(): Promise<string[]> {
    const [sections, offers] = await Promise.all([getMenu(), getOffersContent()]);
    return [
        ...sections.flatMap((section) => section.products.map((product) => product.id)),
        ...(offers?.offers.map((offer) => offer.id) ?? []),
    ];
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
