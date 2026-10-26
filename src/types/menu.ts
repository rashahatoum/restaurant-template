// Menu domain types. Mock data (src/data/mock/) and future API responses
// must both match these shapes; components only see them through services/.

export interface Category {
    id: string;
    name: string;
    /** Display order, ascending. */
    order: number;
}

export interface ProductOption {
    id: string;
    name: string;
    /** Added to the base price, in the restaurant currency (0 = no change). */
    priceDelta: number;
}

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
    image: string;
    isBestSeller: boolean;
    isAvailable: boolean;
    optionGroups?: readonly ProductOptionGroup[];
}

/** A category with its products, as the menu page renders it. */
export interface MenuSection {
    category: Category;
    products: readonly Product[];
}
