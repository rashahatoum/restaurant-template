import { productKey } from "@/lib/cart";
import type { MenuItemDetails, Product, ProductOptionGroup } from "@/types/menu";

/** Section id for a category on /menu (the section dropdown and banner buttons jump to it). */
export const categoryAnchor = (categoryId: string) => `category-${categoryId}`;

/** The offers section id on /menu: banner buttons and home offer cards link here. */
export const OFFERS_ANCHOR = categoryAnchor("offers");

/**
 * The price-changing single choice shown on the menu (today: size).
 * Products have at most one such group.
 */
export function getSingleChoiceGroup(product: Product): ProductOptionGroup | undefined {
    return product.optionGroups?.find((group) => group.maxSelect === 1);
}

type BestSellerFields = Pick<Product, "isBestSeller" | "bestSellerOrder">;

/**
 * Best sellers in slider order: by bestSellerOrder, then (no number yet, e.g.
 * mock data) in list order. Shared by the home slider and the dashboard.
 */
export function sortBestSellers<T extends BestSellerFields>(products: readonly T[]): T[] {
    return products
        .filter((product) => product.isBestSeller)
        .map((product, index) => ({ product, index }))
        .sort((a, b) => (a.product.bestSellerOrder ?? Infinity) - (b.product.bestSellerOrder ?? Infinity) || a.index - b.index)
        .map(({ product }) => product);
}

/** Every best seller numbered 1…n in its slider order; others carry no number. List order is kept. */
export function numberBestSellers<T extends BestSellerFields>(products: readonly T[]): T[] {
    const places = new Map(sortBestSellers(products).map((product, index) => [product, index + 1]));
    return products.map((product) => {
        const place = places.get(product);
        if (place) return product.bestSellerOrder === place ? product : { ...product, bestSellerOrder: place };
        if (product.bestSellerOrder === undefined) return product;
        const copy = { ...product };
        delete copy.bestSellerOrder;
        return copy;
    });
}

/** A product as its details page shows it (services/menu and the dashboard preview). */
export function toMenuItemDetails(product: Product): MenuItemDetails {
    const sizeGroup = getSingleChoiceGroup(product);
    return {
        id: product.id,
        kind: "product",
        itemKey: productKey(product.id),
        name: product.name,
        description: product.description,
        image: product.image,
        imageStyle: product.imageStyle,
        price: product.price,
        parts: product.ingredients,
        badge: product.isBestSeller ? "الأكثر طلباً" : undefined,
        isAvailable: product.isAvailable,
        options: sizeGroup?.options,
        optionsLabel: sizeGroup?.name,
    };
}
