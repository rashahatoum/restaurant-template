// Dashboard input rules, pure. Failures use the same shape as Laravel's 422
// (field → messages), so screens show local and API errors the same way.
// Laravel will enforce the same rules on its side.

import { appError, fail, ok, type AppError, type Result } from "@/lib/api/errors";
import { normalizePhone } from "@/lib/contact";
import { toWesternDigits } from "@/lib/digits";
import { toPlainText } from "@/lib/highlight";
import { branchWhatsApp, normalizeSocialUrl, parseHoursSchema, socialName } from "@/lib/site-info";
import { MAX_TABLES } from "@/lib/table-session";
import type { AboutContent, FeatureIconKey, HeroContent, SiteInfo } from "@/types/content";
import type { BannerInput, OfferInput, OffersSettings, ProductInput, ReviewInput, ReviewsSettings } from "@/types/dashboard";
import type { Category, Product } from "@/types/menu";
import type { OrderingSettings } from "@/types/order";

export const MAX_PRICE = 10_000_000;

/** "٢٥٠", "1,250", "250 ل.س" → 250. Null if it isn't a whole number. */
export function parsePriceInput(text: string): number | null {
    const normalized = toWesternDigits(text)
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

/** An odd number of ** would show the stars to customers. */
const hasStrayMarkers = (text: string) => (text.match(/\*\*/g)?.length ?? 0) % 2 !== 0;
const STRAY_MARKERS = "في رمز ** زيادة، شيله";

/** Eyebrow and title of a home section (offers, reviews, about); `limits` when a section allows longer ones. */
export function checkSectionText(
    settings: Partial<Pick<OffersSettings, "eyebrow" | "title">>,
    limits: { eyebrow: number; title: number } = SECTION_TEXT_LIMITS
): AppError | null {
    const errors: Record<string, string[]> = {};
    const add = (field: string, message: string) => (errors[field] ??= []).push(message);

    if (settings.eyebrow !== undefined) {
        if (!settings.eyebrow.trim()) add("eyebrow", "اكتب العنوان الصغير");
        else if (settings.eyebrow.length > limits.eyebrow) add("eyebrow", `لازم يكون ${limits.eyebrow} حرف أو أقل`);
    }
    if (settings.title !== undefined) {
        const plain = toPlainText(settings.title);
        if (!plain.trim()) add("title", "اكتب العنوان");
        else if (plain.length > limits.title) add("title", `العنوان لازم يكون ${limits.title} حرف أو أقل`);
        else if (hasStrayMarkers(settings.title)) add("title", STRAY_MARKERS);
    }

    return Object.keys(errors).length > 0 ? appError("validation", { fieldErrors: errors }) : null;
}

/* =========================
   REVIEWS
========================= */

export const REVIEW_LIMITS = {
    /** First name only (privacy). */
    customerName: 20,
    question: 120,
    /** Without the ** markers; the card clamps longer replies. */
    answer: 220,
    /** Display text, e.g. "11:02 م". */
    time: 12,
} as const;

/** The reviews section's texts: eyebrow, title (checkSectionText) and the default question. */
export function checkReviewsSettings(settings: Partial<Pick<ReviewsSettings, "eyebrow" | "title" | "defaultQuestion">>): AppError | null {
    const errors: Record<string, string[]> = { ...(checkSectionText(settings)?.fieldErrors ?? {}) };

    if (settings.defaultQuestion !== undefined) {
        const question = settings.defaultQuestion;
        if (!question.trim()) errors.defaultQuestion = ["اكتب السؤال اللي بيطلع فوق كل رأي"];
        else if (question.length > REVIEW_LIMITS.question) errors.defaultQuestion = [`السؤال ${REVIEW_LIMITS.question} حرف أو أقل`];
    }

    return Object.keys(errors).length > 0 ? appError("validation", { fieldErrors: errors }) : null;
}

/** The rules a saved review must follow; collects every problem at once. */
export function checkReviewInput(input: ReviewInput): AppError | null {
    const errors: Record<string, string[]> = {};
    const add = (field: string, message: string) => (errors[field] ??= []).push(message);

    if (!input.customerName.trim()) add("customerName", "اكتب اسم الزبون");
    else if (input.customerName.length > REVIEW_LIMITS.customerName) add("customerName", `الاسم ${REVIEW_LIMITS.customerName} حرف أو أقل`);

    if ((input.question?.length ?? 0) > REVIEW_LIMITS.question) add("question", `السؤال ${REVIEW_LIMITS.question} حرف أو أقل`);

    const answer = toPlainText(input.answer);
    if (!answer.trim()) add("answer", "اكتب شو قال الزبون");
    else if (answer.length > REVIEW_LIMITS.answer) add("answer", `الرد ${REVIEW_LIMITS.answer} حرف أو أقل، لحتى يبيّن كامل بالكرت`);
    else if (hasStrayMarkers(input.answer)) add("answer", STRAY_MARKERS);

    if ((input.time?.length ?? 0) > REVIEW_LIMITS.time) add("time", "الوقت مش مفهوم، اختاره من الساعة");

    return Object.keys(errors).length > 0 ? appError("validation", { fieldErrors: errors }) : null;
}

/* =========================
   RESTAURANT INFO
========================= */

export const SITE_INFO_LIMITS = {
    tagline: 120,
    taglineLines: 3,
    /** The restaurant's and the branches' together. */
    phones: 10,
    branches: 6,
    branchName: 30,
    branchAddress: 80,
} as const;

/** The rules saved restaurant info must follow; collects every problem at once. */
export function checkSiteInfoInput(input: SiteInfo): AppError | null {
    const errors: Record<string, string[]> = {};
    const add = (field: string, message: string) => (errors[field] ??= []).push(message);

    if (!input.tagline.trim()) add("tagline", "اكتب جملة تعريف قصيرة");
    else if (input.tagline.length > SITE_INFO_LIMITS.tagline) add("tagline", `التعريف ${SITE_INFO_LIMITS.tagline} حرف أو أقل`);
    else if (input.tagline.split("\n").length > SITE_INFO_LIMITS.taglineLines) add("tagline", `${SITE_INFO_LIMITS.taglineLines} أسطر بالكتير`);

    if (!input.phones.some((phone) => !phone.branchId)) add("phones", "ضيف رقم واحد للمطعم على الأقل، ليقدر الزبون يتواصل معكن");
    else if (input.phones.length > SITE_INFO_LIMITS.phones) add("phones", `أقصى شي ${SITE_INFO_LIMITS.phones} أرقام`);
    // The same number may serve the restaurant and a branch, but not twice in one of them
    const seen = new Set<string>();
    input.phones.forEach((phone, index) => {
        const field = `phones.${index}.number`;
        const key = `${phone.branchId ?? ""}|${phone.number}`;
        if (normalizePhone(phone.number) !== phone.number) add(field, "الرقم مش مفهوم. اكتبه متل 0930 123 456");
        else if (seen.has(key)) add(field, phone.branchId ? "هالرقم مكتوب مرتين لنفس الفرع" : "هالرقم مكتوب مرتين");
        seen.add(key);
    });

    if (input.branches.length === 0) add("branches", "ضيف فرع واحد على الأقل");
    else if (input.branches.length > SITE_INFO_LIMITS.branches) add("branches", `أقصى شي ${SITE_INFO_LIMITS.branches} فروع`);
    input.branches.forEach((branch, index) => {
        if (!branch.name.trim()) add(`branches.${index}.name`, "اكتب اسم الفرع");
        else if (branch.name.length > SITE_INFO_LIMITS.branchName) add(`branches.${index}.name`, `${SITE_INFO_LIMITS.branchName} حرف أو أقل`);
        if (!branch.address.trim()) add(`branches.${index}.address`, "اكتب العنوان");
        else if (branch.address.length > SITE_INFO_LIMITS.branchAddress) add(`branches.${index}.address`, `${SITE_INFO_LIMITS.branchAddress} حرف أو أقل`);
        if (branch.mapUrl !== undefined && !/^https:\/\/\S+$/.test(branch.mapUrl)) {
            add(`branches.${index}.mapUrl`, "انسخ الرابط من Google Maps (زر «مشاركة»)");
        }
    });

    // Text and schema come from the same two clock times
    if (Boolean(input.openingHours) !== Boolean(parseHoursSchema(input.openingHoursSchema))) {
        add("openingHours", "اختار ساعة الفتح وساعة السكّر، أو فضّي التنين");
    }

    input.socialLinks?.forEach((link, index) => {
        if (normalizeSocialUrl(link.platform, link.url) !== link.url) {
            add(`socialLinks.${index}.url`, `هالرابط مش لصفحة على ${socialName(link.platform)}`);
        }
    });

    return Object.keys(errors).length > 0 ? appError("validation", { fieldErrors: errors }) : null;
}

/* =========================
   ORDERING
========================= */

export const ORDERING_LIMITS = {
    maxTables: MAX_TABLES,
    greeting: 120,
    closing: 200,
    thankYou: 240,
} as const;

/** The only {…} the message texts may use (lib/order fillTemplate). */
const unknownPlaceholder = (text: string) => (text.match(/\{[^{}]*\}/g) ?? []).some((token) => token !== "{restaurant}" && token !== "{name}");

/**
 * The rules saved ordering settings must follow, against the restaurant info
 * they point at; collects every problem at once. Orders go out on WhatsApp,
 * so what's switched on needs a WhatsApp number to go to.
 */
export function checkOrderingInput(input: OrderingSettings, info: Pick<SiteInfo, "phones" | "branches">): AppError | null {
    const errors: Record<string, string[]> = {};
    const add = (field: string, message: string) => (errors[field] ??= []).push(message);

    const { delivery, dineIn } = input;
    if (!Number.isInteger(delivery.fee) || delivery.fee < 0) add("delivery.fee", "اكتب رسوم التوصيل رقم، متل 150 (أو 0 إذا مجاني)");
    else if (delivery.fee > MAX_PRICE) add("delivery.fee", "الرسوم كبيرة كتير، تأكد منها");
    const deliveryPhone = info.phones.find((phone) => phone.id === delivery.phoneId && !phone.branchId);
    if (delivery.isEnabled && !deliveryPhone?.hasWhatsApp) add("delivery.phoneId", "اختار رقم عليه واتساب لتوصل عليه طلبات التوصيل");

    const seen = new Set<string>();
    dineIn.branches.forEach((setting, index) => {
        const field = `dineIn.branches.${index}`;
        if (!info.branches.some((branch) => branch.id === setting.branchId) || seen.has(setting.branchId)) {
            add("dineIn", "في فرع مش موجود، حدّث الصفحة");
        }
        seen.add(setting.branchId);
        if (!Number.isInteger(setting.tableCount) || setting.tableCount < 0 || setting.tableCount > ORDERING_LIMITS.maxTables) {
            add(`${field}.tableCount`, `عدد الطاولات من 1 لـ ${ORDERING_LIMITS.maxTables}`);
        } else if (setting.isEnabled && setting.tableCount === 0) {
            add(`${field}.tableCount`, "اكتب كم طاولة بالفرع");
        }
        if (setting.isEnabled && !branchWhatsApp(info.phones, setting.branchId)) {
            add(`${field}.isEnabled`, "هالفرع ما إلو رقم واتساب. ضيفه من «معلومات المطعم» أول");
        }
    });
    if (dineIn.isEnabled && !dineIn.branches.some((setting) => setting.isEnabled)) add("dineIn", "شغّل طاولات فرع واحد على الأقل، أو طفّي طلبات الطاولات");

    const texts = [
        ["message.greeting", input.message.greeting, ORDERING_LIMITS.greeting, true],
        ["message.closing", input.message.closing, ORDERING_LIMITS.closing, false],
        ["thankYou", input.thankYou, ORDERING_LIMITS.thankYou, true],
    ] as const;
    for (const [field, text, limit, isRequired] of texts) {
        if (isRequired && !text.trim()) add(field, "هالنص ما بيصير يكون فاضي");
        else if (text.length > limit) add(field, `${limit} حرف أو أقل`);
        else if (unknownPlaceholder(text)) add(field, "استعمل زرّي «اسم المطعم» و«اسم الزبون» بدل ما تكتب أقواس { }");
    }

    return Object.keys(errors).length > 0 ? appError("validation", { fieldErrors: errors }) : null;
}

/* =========================
   HERO
========================= */

/** Every FeatureIconKey (the type fails to compile if one is missing); the rules stay free of UI imports. */
const FEATURE_ICON_KEYS = {
    fresh: true,
    fire: true,
    quality: true,
    delivery: true,
    fast: true,
    heart: true,
} as const satisfies Record<FeatureIconKey, true>;

export const HERO_LIMITS = {
    badge: 24,
    /** Phones give it two thirds of the width, beside the turning spit. */
    headline: 32,
    actionLabel: 14,
    features: 3,
    featureLabel: 28,
} as const;

/** The rules saved hero texts must follow; collects every problem at once. */
export function checkHeroInput(input: HeroContent): AppError | null {
    const errors: Record<string, string[]> = {};
    const add = (field: string, message: string) => (errors[field] ??= []).push(message);

    if ((input.badge?.length ?? 0) > HERO_LIMITS.badge) add("badge", `الشارة ${HERO_LIMITS.badge} حرف أو أقل`);

    if (!input.headline.trim()) add("headline", "اكتب الجملة الرئيسية");
    else if (input.headline.length > HERO_LIMITS.headline) add("headline", `لازم تكون ${HERO_LIMITS.headline} حرف أو أقل`);

    for (const field of ["primaryActionLabel", "secondaryActionLabel"] as const) {
        if (!input[field].trim()) add(field, "اكتب شو مكتوب على الزر");
        else if (input[field].length > HERO_LIMITS.actionLabel) add(field, `نص الزر ${HERO_LIMITS.actionLabel} حرف أو أقل`);
    }

    if (input.features.length !== HERO_LIMITS.features) add("features", "الميزات لازم تكون تلاتة");
    input.features.forEach((feature, index) => {
        if (!feature.label.trim()) add(`features.${index}.label`, "اكتب الميزة");
        else if (feature.label.length > HERO_LIMITS.featureLabel) add(`features.${index}.label`, `${HERO_LIMITS.featureLabel} حرف أو أقل`);
        if (!Object.hasOwn(FEATURE_ICON_KEYS, feature.icon)) add(`features.${index}.icon`, "اختار أيقونة");
    });

    return Object.keys(errors).length > 0 ? appError("validation", { fieldErrors: errors }) : null;
}

/* =========================
   ABOUT
========================= */

export const ABOUT_LIMITS = {
    eyebrow: 40,
    /** Without the ** markers. */
    title: 40,
    paragraphs: 4,
    paragraph: 320,
    closing: 120,
    badge: 24,
} as const;

/** Field key of one paragraph, as Laravel would name it in a 422. */
export const paragraphField = (index: number) => `paragraphs.${index}`;

/** The rules a saved «من نحن» must follow; collects every problem at once. */
export function checkAboutInput(input: AboutContent): AppError | null {
    const errors: Record<string, string[]> = {};
    const add = (field: string, message: string) => (errors[field] ??= []).push(message);

    const section = checkSectionText(input, ABOUT_LIMITS);
    Object.entries(section?.fieldErrors ?? {}).forEach(([field, messages]) => messages.forEach((message) => add(field, message)));

    if (input.paragraphs.length === 0) add("paragraphs", "اكتب فقرة وحدة على الأقل");
    else if (input.paragraphs.length > ABOUT_LIMITS.paragraphs) add("paragraphs", `أقصى شي ${ABOUT_LIMITS.paragraphs} فقرات`);
    input.paragraphs.forEach((paragraph, index) => {
        const plain = toPlainText(paragraph);
        if (!plain.trim()) add(paragraphField(index), "الفقرة فاضية، اكتبها أو احذفها");
        else if (plain.length > ABOUT_LIMITS.paragraph) add(paragraphField(index), `الفقرة ${ABOUT_LIMITS.paragraph} حرف أو أقل`);
        else if (hasStrayMarkers(paragraph)) add(paragraphField(index), STRAY_MARKERS);
    });

    const closing = toPlainText(input.closing);
    if (!closing.trim()) add("closing", "اكتب الجملة الأخيرة");
    else if (closing.length > ABOUT_LIMITS.closing) add("closing", `لازم تكون ${ABOUT_LIMITS.closing} حرف أو أقل`);
    else if (hasStrayMarkers(input.closing)) add("closing", STRAY_MARKERS);

    if (!input.image.src) add("image", "«من نحن» بدّه صورة");
    if ((input.badge?.length ?? 0) > ABOUT_LIMITS.badge) add("badge", `الشارة ${ABOUT_LIMITS.badge} حرف أو أقل`);

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
export type ProductQuickChanges = Partial<Pick<Product, "price" | "isAvailable" | "isBestSeller" | "bestSellerOrder">>;

/**
 * Undoing "شيل من الأكثر مبيعاً" puts the product back in its old place: just
 * before whoever moved up into it (the repository renumbers 1…n after).
 */
export function undoBestSellerPlace(product: Product, changes: ProductQuickChanges): ProductQuickChanges {
    return changes.isBestSeller === false && product.bestSellerOrder !== undefined
        ? { bestSellerOrder: product.bestSellerOrder - 0.5 }
        : {};
}

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
