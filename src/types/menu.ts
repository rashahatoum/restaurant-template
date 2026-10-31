// Menu domain types. Mock data (src/data/mock/) and future API responses
// must both match these shapes; components only see them through services/.

export interface Category {
    id: string;
    name: string;
    /** Full photo (not cut out) for the menu category card. Optional: the card falls back to the first product photo. */
    image?: string;
    /** Display order, ascending. */
    order: number;
}

export interface ProductOption {
    id: string;
    /** Full name, used in the cart and the WhatsApp message. */
    name: string;
    /** Optional compact label for tight UI (the menu toggle). Falls back to name. */
    shortName?: string;
    /** Added to the base price, in the restaurant currency (0 = no change). */
    priceDelta: number;
}

/**
 * Price-changing choices only (e.g. size). Free-form requests such as
 * "no garlic" go in the cart notes instead, to keep the menu simple.
 */
export interface ProductOptionGroup {
    id: string;
    name: string;
    /** At least one option must be picked. */
    required: boolean;
    maxSelect: number;
    options: readonly ProductOption[];
}

export interface Product {
    /** Kebab-case, also used for the image file name and future URLs. */
    id: string;
    categoryId: Category["id"];
    name: string;
    description: string;
    ingredients: readonly string[];
    /** Whole units of the restaurant currency (see restaurantConfig.currency). */
    price: number;
    /** Square dish photo on a transparent background. Optional: the menu shows a placeholder. */
    image?: string;
    isBestSeller: boolean;
    isAvailable: boolean;
    optionGroups?: readonly ProductOptionGroup[];
}

/**
 * A product or an offer as its details page (/menu/<id>) shows it.
 * Product and offer ids share this URL space, so they must not collide.
 */
export interface MenuItemDetails {
    id: string;
    kind: "product" | "offer";
    /** Cart reference (lib/cart productKey / offerKey). */
    itemKey: string;
    name: string;
    description?: string;
    image?: string;
    price: number;
    /** Ingredients (product) or what the offer includes. */
    parts: readonly string[];
    /** Offers: what comes free. */
    freeItem?: string;
    badge?: string;
    isAvailable: boolean;
    /** Single-choice, price-changing options (size). */
    options?: readonly ProductOption[];
    optionsLabel?: string;
}

/** A category with its products, as the menu page renders it. */
export interface MenuSection {
    category: Category;
    products: readonly Product[];
}
