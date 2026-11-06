// The product form's model, pure. Number fields stay text while typing (so
// "٢٥", "" or "1,2" never break anything); they're parsed only on save.

import { appError, fail, ok, type Result } from "@/lib/api/errors";
import { parsePriceInput, sizeField } from "@/lib/dashboard/validation";
import type { ProductInput } from "@/types/dashboard";
import type { ImageStyle, Product, ProductOptionGroup } from "@/types/menu";

export interface SizeRow {
    /** Kept for existing sizes: carts refer to it. */
    id: string;
    name: string;
    shortName: string;
    /** The full price of this size, as typed (the payload stores the difference from the first size). */
    price: string;
}

export interface ProductFormValues {
    name: string;
    description: string;
    categoryId: string;
    price: string;
    ingredients: string[];
    isAvailable: boolean;
    isBestSeller: boolean;
    image?: string;
    imageStyle?: ImageStyle;
    sizes: SizeRow[];
    /** Name of the size group, e.g. "الحجم" (kept from the product). */
    sizesLabel: string;
}

const DEFAULT_SIZES_LABEL = "الحجم";

/** The form's starting values: the product's, or an empty product in a category. */
export function toFormValues(product: Product | undefined, categoryId: string): ProductFormValues {
    const group = product?.optionGroups?.find((candidate) => candidate.maxSelect === 1);
    return {
        name: product?.name ?? "",
        description: product?.description ?? "",
        categoryId: product?.categoryId ?? categoryId,
        price: product ? String(product.price) : "",
        ingredients: [...(product?.ingredients ?? [])],
        isAvailable: product?.isAvailable ?? true,
        isBestSeller: product?.isBestSeller ?? false,
        image: product?.image,
        imageStyle: product?.imageStyle,
        sizes:
            group?.options.map((option) => ({
                id: option.id,
                name: option.name,
                shortName: option.shortName ?? "",
                price: String((product?.price ?? 0) + option.priceDelta),
            })) ?? [],
        sizesLabel: group?.name ?? DEFAULT_SIZES_LABEL,
    };
}

/** Same content (decides whether the save bar shows). */
export const isSameForm = (a: ProductFormValues, b: ProductFormValues) => JSON.stringify(a) === JSON.stringify(b);

function sizeGroup(values: ProductFormValues, deltas: number[]): ProductOptionGroup[] | undefined {
    if (values.sizes.length === 0) return undefined;
    return [
        {
            id: "size",
            name: values.sizesLabel,
            required: true,
            maxSelect: 1,
            options: values.sizes.map((row, index) => ({
                id: row.id,
                name: row.name.trim(),
                ...(row.shortName.trim() ? { shortName: row.shortName.trim() } : {}),
                priceDelta: deltas[index],
            })),
        },
    ];
}

/**
 * The product price and each size's difference from it. With sizes, the
 * owner types full prices; the first size's price becomes the product price
 * (the size preselected on the menu) and the others are stored as differences,
 * which is what the cart and the WhatsApp message already use.
 */
function priceAndDeltas(values: ProductFormValues, read: (text: string, index: number | null) => number) {
    if (values.sizes.length === 0) return { price: read(values.price, null), deltas: [] };
    const prices = values.sizes.map((row, index) => read(row.price, index));
    return { price: prices[0], deltas: prices.map((price) => price - prices[0]) };
}

/**
 * Text → a product payload. Fails only on numbers that can't be read; the
 * other rules (required, lengths…) are the repository's (checkProductInput).
 */
export function parseProductForm(values: ProductFormValues): Result<ProductInput> {
    const errors: Record<string, string[]> = {};

    const { price, deltas } = priceAndDeltas(values, (text, index) => {
        const value = parsePriceInput(text);
        if (value === null) {
            const message = text.trim() ? "السعر لازم يكون رقم، متل 250" : "اكتب السعر";
            // A size's price error sits under that size (keyed like the API's field)
            errors[index === null ? "price" : sizeField(index, "priceDelta")] = [message];
        }
        return value ?? 0;
    });

    if (Object.keys(errors).length > 0) return fail(appError("validation", { fieldErrors: errors }));

    return ok({
        categoryId: values.categoryId,
        name: values.name.trim(),
        description: values.description.trim(),
        ingredients: values.ingredients.map((item) => item.trim()).filter(Boolean),
        price,
        image: values.image,
        imageStyle: values.imageStyle,
        isAvailable: values.isAvailable,
        isBestSeller: values.isBestSeller,
        optionGroups: sizeGroup(values, deltas),
    });
}

/** A best-effort product for the live preview (never fails: unreadable numbers show as 0). */
export function previewProduct(values: ProductFormValues, id: string): Product {
    const { price, deltas } = priceAndDeltas(values, (text) => parsePriceInput(text) ?? 0);
    return {
        id,
        categoryId: values.categoryId,
        name: values.name.trim() || "اسم الصنف",
        description: values.description.trim(),
        ingredients: values.ingredients,
        price,
        image: values.image,
        imageStyle: values.imageStyle,
        isAvailable: values.isAvailable,
        isBestSeller: values.isBestSeller,
        optionGroups: values.sizes.length > 1 ? sizeGroup(values, deltas) : undefined,
    };
}
