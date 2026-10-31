import type { Product, ProductOptionGroup } from "@/types/menu";

/**
 * The price-changing single choice shown on the menu (today: size).
 * Products have at most one such group.
 */
export function getSingleChoiceGroup(product: Product): ProductOptionGroup | undefined {
    return product.optionGroups?.find((group) => group.maxSelect === 1);
}
