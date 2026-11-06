import { productKey } from "@/lib/cart";
import type { MenuItemDetails, Product, ProductOptionGroup } from "@/types/menu";

/**
 * The price-changing single choice shown on the menu (today: size).
 * Products have at most one such group.
 */
export function getSingleChoiceGroup(product: Product): ProductOptionGroup | undefined {
    return product.optionGroups?.find((group) => group.maxSelect === 1);
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
