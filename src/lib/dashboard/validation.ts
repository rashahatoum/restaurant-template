// Dashboard input rules, pure. Failures use the same shape as Laravel's 422
// (field → messages), so screens show local and API errors the same way.
// Laravel will enforce the same rules on its side.

import { appError, fail, ok, type AppError, type Result } from "@/lib/api/errors";
import type { Product } from "@/types/menu";

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
