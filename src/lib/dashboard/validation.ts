// Dashboard input rules, pure. Failures use the same shape as Laravel's 422
// (field → messages), so screens show local and API errors the same way.
// Laravel will enforce the same rules on its side.

import { appError, fail, ok, type AppError, type Result } from "@/lib/api/errors";
import { toPlainText } from "@/lib/highlight";
import type { BannerInput, OfferInput, OffersSettings, ProductInput } from "@/types/dashboard";
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

/* =========================
   CATEGORIES
========================= */

export const CATEGORY_NAME_MAX = 24;

/** "  سندويشات " and "سندويشات" are the same name. */
const sameName = (a: string, b: string) => a.trim().replace(/\s+/g, " ") === b.trim().replace(/\s+/g, " ");

/** The trimmed name when it's fine (required, short, unique); `selfId` skips the category being renamed. */
export function validateCategoryName(
    name: string,
    categories: readonly Pick<Category, "id" | "name">[],
    selfId?: string
): Result<string> {
    const trimmed = name.trim().replace(/\s+/g, " ");
    if (!trimmed) return fail(invalid("name", "اكتب اسم القسم"));
    if (trimmed.length > CATEGORY_NAME_MAX) return fail(invalid("name", `الاسم لازم يكون ${CATEGORY_NAME_MAX} حرف أو أقل`));
    if (categories.some((category) => category.id !== selfId && sameName(category.name, trimmed))) {
        return fail(invalid("name", "في قسم بنفس الاسم"));
    }
    return ok(trimmed);
}

/* =========================
   OFFERS
========================= */

export const OFFER_LIMITS = {
    title: 30,
    items: 6,
    item: 40,
    freeItem: 40,
    badge: 20,
} as const;

export const SECTION_TEXT_LIMITS = {
    eyebrow: 30,
    /** Without the ** markers. */
    title: 40,
} as const;

/** The rules a saved offer must follow; collects every problem at once (like checkProductInput). */
export function checkOfferInput(input: OfferInput): AppError | null {
    const errors: Record<string, string[]> = {};
    const add = (field: string, message: string) => (errors[field] ??= []).push(message);

    if (!input.title.trim()) add("title", "اكتب اسم العرض");
    else if (input.title.length > OFFER_LIMITS.title) add("title", `الاسم لازم يكون ${OFFER_LIMITS.title} حرف أو أقل`);

    if (input.items.length === 0) add("items", "اكتب شو بياخد الزبون، متل: 4 سندويشات شاورما");
    else if (input.items.length > OFFER_LIMITS.items) add("items", `أقصى شي ${OFFER_LIMITS.items} أشياء`);
    else if (input.items.some((item) => item.length > OFFER_LIMITS.item)) add("items", `كل شي لازم يكون ${OFFER_LIMITS.item} حرف أو أقل`);

    if (!input.freeItem.trim()) add("freeItem", "اكتب شو بياخد مجاناً");
    else if (input.freeItem.length > OFFER_LIMITS.freeItem) add("freeItem", `لازم يكون ${OFFER_LIMITS.freeItem} حرف أو أقل`);

    const price = validatePrice(input.price);
    if (!price.ok) add("price", price.error.fieldErrors?.price?.[0] ?? price.error.message);

    // The offer card is built around the photo
    if (!input.image) add("image", "العرض بدّه صورة");

    if ((input.badge?.length ?? 0) > OFFER_LIMITS.badge) add("badge", `الشارة لازم تكون ${OFFER_LIMITS.badge} حرف أو أقل`);

    return Object.keys(errors).length > 0 ? appError("validation", { fieldErrors: errors }) : null;
}

/** Eyebrow and title of a home section (offers now; reviews and about later). */
export function checkSectionText(settings: Partial<Pick<OffersSettings, "eyebrow" | "title">>): AppError | null {
    const errors: Record<string, string[]> = {};
    const add = (field: string, message: string) => (errors[field] ??= []).push(message);

    if (settings.eyebrow !== undefined) {
        if (!settings.eyebrow.trim()) add("eyebrow", "اكتب العنوان الصغير");
        else if (settings.eyebrow.length > SECTION_TEXT_LIMITS.eyebrow) add("eyebrow", `لازم يكون ${SECTION_TEXT_LIMITS.eyebrow} حرف أو أقل`);
    }
    if (settings.title !== undefined) {
        const plain = toPlainText(settings.title);
        if (!plain.trim()) add("title", "اكتب العنوان");
        else if (plain.length > SECTION_TEXT_LIMITS.title) add("title", `العنوان لازم يكون ${SECTION_TEXT_LIMITS.title} حرف أو أقل`);
        // An odd number of ** would show the stars to customers
        else if ((settings.title.match(/\*\*/g)?.length ?? 0) % 2 !== 0) add("title", "في رمز ** زيادة، شيله");
    }

    return Object.keys(errors).length > 0 ? appError("validation", { fieldErrors: errors }) : null;
}

/* =========================
   MENU BANNER
========================= */

export const BANNER_LIMITS = {
    eyebrow: 24,
    /** Per line: the slide's text column is narrow on phones. */
    titleLine: 22,
    titleLines: 2,
    actionLabel: 16,
} as const;

/** The rules a saved slide must follow; collects every problem at once. */
export function checkBannerInput(
    input: BannerInput,
    refs: { categories: readonly Pick<Category, "id">[]; products: readonly Pick<Product, "id">[] }
): AppError | null {
    const errors: Record<string, string[]> = {};
    const add = (field: string, message: string) => (errors[field] ??= []).push(message);

    if ((input.eyebrow?.length ?? 0) > BANNER_LIMITS.eyebrow) add("eyebrow", `لازم يكون ${BANNER_LIMITS.eyebrow} حرف أو أقل`);

    const lines = input.title.split("\n");
    if (!input.title.trim()) add("title", "اكتب العنوان");
    else if (lines.length > BANNER_LIMITS.titleLines) add("title", "العنوان سطرين بالكتير");
    else if (lines.some((line) => line.length > BANNER_LIMITS.titleLine)) {
        add("title", `كل سطر ${BANNER_LIMITS.titleLine} حرف أو أقل، لحتى يبيّن على الموبايل`);
    }

    if (!input.image.src) add("image", "الشريحة بدها صورة");

    if (input.action) {
        const { label, target } = input.action;
        if (!label.trim()) add("action.label", "اكتب شو مكتوب على الزر");
        else if (label.length > BANNER_LIMITS.actionLabel) add("action.label", `نص الزر ${BANNER_LIMITS.actionLabel} حرف أو أقل`);

        if (target.kind === "category" && !refs.categories.some((category) => category.id === target.categoryId)) {
            add("action.target", "اختار القسم");
        } else if (target.kind === "product" && !refs.products.some((product) => product.id === target.productId)) {
            add("action.target", "اختار الصنف");
        }
    }

    return Object.keys(errors).length > 0 ? appError("validation", { fieldErrors: errors }) : null;
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
