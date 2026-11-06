// Dashboard input rules, pure. Failures use the same shape as Laravel's 422
// (field → messages), so screens show local and API errors the same way.
// Laravel will enforce the same rules on its side.

import { appError, fail, ok, type AppError, type Result } from "@/lib/api/errors";
import type { ProductInput } from "@/types/dashboard";
import type { Category, Product } from "@/types/menu";

export const MAX_PRICE = 10_000_000;

/** Arabic-Indic (٠ U+0660…) and Persian (۰ U+06F0…) digits, as typed on Arabic keyboards. */
const EASTERN_DIGITS = /[٠-٩۰-۹]/g;

const toWesternDigit = (digit: string) => {
    const code = digit.charCodeAt(0);
    return String(code - (code >= 0x06f0 ? 0x06f0 : 0x0660));
};

/** "٢٥٠", "1,250", "250 ل.س" → 250. Null if it isn't a whole number. */
export function parsePriceInput(text: string): number | null {
    const normalized = text
        .replace(EASTERN_DIGITS, toWesternDigit)
        .replace(/[\s,،٬]/g, "")
        .replace(/ل\.?س\.?$/, "");
    return /^\d+$/.test(normalized) ? Number(normalized) : null;
}

const invalid = (field: string, message: string): AppError =>
    appError("validation", { message, fieldErrors: { [field]: [message] } });

/** The price when it's fine (null = typed text that isn't a number), else a validation error on `price`. */
export function validatePrice(price: number | null): Result<number> {
    if (price === null) return fail(invalid("price", "السعر لازم يكون رقم، متل 250"));
    if (price <= 0) return fail(invalid("price", "السعر لازم يكون أكبر من صفر"));
    if (price > MAX_PRICE) return fail(invalid("price", "السعر كبير كتير، تأكد منه"));
    return ok(price);
}

/* =========================
   FULL PRODUCT (form)
========================= */

export const PRODUCT_LIMITS = {
    name: 40,
    description: 160,
    ingredients: 10,
    ingredient: 30,
    sizeName: 24,
    sizeShortName: 10,
} as const;

/** Field key of one size option, as Laravel would name it in a 422. */
export const sizeField = (index: number, field: "name" | "shortName" | "priceDelta") =>
    `optionGroups.0.options.${index}.${field}`;

/**
 * The rules a saved product must follow (Laravel will apply the same ones).
 * Collects every problem at once, so the form can mark all fields together.
 */
export function checkProductInput(
    input: ProductInput,
    categories: readonly Pick<Category, "id">[]
): AppError | null {
    const errors: Record<string, string[]> = {};
    const add = (field: string, message: string) => (errors[field] ??= []).push(message);

    if (!input.name.trim()) add("name", "اكتب اسم الصنف");
    else if (input.name.length > PRODUCT_LIMITS.name) add("name", `الاسم لازم يكون ${PRODUCT_LIMITS.name} حرف أو أقل`);

    const price = validatePrice(input.price);
    if (!price.ok) add("price", price.error.fieldErrors?.price?.[0] ?? price.error.message);

    if (!categories.some((category) => category.id === input.categoryId)) add("categoryId", "اختار قسم للصنف");

    if (input.description.length > PRODUCT_LIMITS.description) {
        add("description", `الوصف لازم يكون ${PRODUCT_LIMITS.description} حرف أو أقل`);
    }

    if (input.ingredients.length > PRODUCT_LIMITS.ingredients) {
        add("ingredients", `أقصى شي ${PRODUCT_LIMITS.ingredients} مكونات (أكتر من هيك ما بيبيّنوا منيح عالموبايل)`);
    } else if (input.ingredients.some((item) => item.length > PRODUCT_LIMITS.ingredient)) {
        add("ingredients", `كل مكوّن لازم يكون ${PRODUCT_LIMITS.ingredient} حرف أو أقل`);
    }

    if (input.isBestSeller && !input.image) add("isBestSeller", "«الأكثر مبيعاً» بدّه صورة للصنف");

    const options = input.optionGroups?.[0]?.options;
    if (options) {
        if (options.length < 2) add("optionGroups", "الأحجام لازم تكون حجمين أو أكتر، أو شيلها");
        const seen = new Set<string>();
        options.forEach((option, index) => {
            const name = option.name.trim();
            if (!name) add(sizeField(index, "name"), "اكتب اسم الحجم");
            else if (name.length > PRODUCT_LIMITS.sizeName) add(sizeField(index, "name"), "الاسم طويل");
            else if (seen.has(name)) add(sizeField(index, "name"), "في حجم بنفس الاسم");
            seen.add(name);

            if ((option.shortName?.length ?? 0) > PRODUCT_LIMITS.sizeShortName) {
                add(sizeField(index, "shortName"), `الاسم المختصر ${PRODUCT_LIMITS.sizeShortName} حروف أو أقل`);
            }
            // The size's full price (product price + difference) must be a valid price;
            // a size may cost less than the first one (negative difference)
            const sizePrice = input.price + option.priceDelta;
            if (!Number.isInteger(option.priceDelta) || sizePrice <= 0 || sizePrice > MAX_PRICE) {
                add(sizeField(index, "priceDelta"), "سعر الحجم لازم يكون رقم أكبر من صفر");
            }
        });
    }

    return Object.keys(errors).length > 0
        ? appError("validation", { fieldErrors: errors })
        : null;
}

/** Changes the product list can make without opening the form. */
export type ProductQuickChanges = Partial<Pick<Product, "price" | "isAvailable" | "isBestSeller">>;

/** Null when the changes are fine for this product. */
export function checkProductQuickChanges(product: Product, changes: ProductQuickChanges): AppError | null {
    if (changes.price !== undefined) {
        const checked = validatePrice(changes.price);
        if (!checked.ok) return checked.error;
    }
    // The home slider shows the dish photo (services/menu getBestSellers)
    if (changes.isBestSeller && !product.image) {
        return invalid("isBestSeller", "«الأكثر مبيعاً» بدّه صورة للصنف. ضيف صورة أول.");
    }
    return null;
}
