// The offer form's model, pure (same idea as product-form.ts): the price stays
// text while typing and is parsed only on save.

import { appError, fail, ok, type Result } from "@/lib/api/errors";
import { slugToSend } from "@/lib/slug";
import { checkOfferInput, parsePriceInput } from "@/lib/dashboard/validation";
import type { OfferInput } from "@/types/dashboard";
import type { Offer } from "@/types/content";
import type { ImageStyle } from "@/types/menu";

export interface OfferFormValues {
    title: string;
    items: string[];
    freeItem: string;
    price: string;
    image?: string;
    imageStyle?: ImageStyle;
    badge: string;
    isActive: boolean;
    /** «رابط الصفحة»: the offer's current id, or empty for a new one. */
    slug: string;
}

export function toOfferFormValues(offer: Offer | undefined): OfferFormValues {
    return {
        title: offer?.title ?? "",
        items: [...(offer?.items ?? [])],
        freeItem: offer?.freeItem ?? "",
        price: offer ? String(offer.price) : "",
        image: offer?.image,
        imageStyle: offer?.imageStyle,
        badge: offer?.badge ?? "",
        isActive: offer?.isActive ?? true,
        slug: offer?.id ?? "",
    };
}

export const isSameOfferForm = (a: OfferFormValues, b: OfferFormValues) => JSON.stringify(a) === JSON.stringify(b);

const toInput = (values: OfferFormValues, price: number): OfferInput => {
    const badge = values.badge.trim();
    return {
        title: values.title.trim(),
        items: values.items.map((item) => item.trim()).filter(Boolean),
        freeItem: values.freeItem.trim(),
        price,
        image: values.image ?? "",
        ...(values.imageStyle ? { imageStyle: values.imageStyle } : {}),
        ...(badge ? { badge } : {}),
        isActive: values.isActive,
    };
};

/**
 * Text → an offer payload. A price that can't be read fails here, together
 * with the other fields' problems (so an empty form shows every error at
 * once); a readable payload is checked again by the repository.
 */
export function parseOfferForm(values: OfferFormValues, currentId?: string): Result<OfferInput> {
    const price = parsePriceInput(values.price);
    const slug = slugToSend(values.slug, currentId);
    if (price !== null && slug.ok) return ok({ ...toInput(values, price), ...(slug.data ? { slug: slug.data } : {}) });

    // A valid stand-in price, so only the other fields are reported from this check
    const others = checkOfferInput(toInput(values, price ?? 1))?.fieldErrors ?? {};
    const priceErrors: Record<string, string[]> =
        price === null ? { price: [values.price.trim() ? "السعر لازم يكون رقم، متل 1000" : "اكتب السعر"] } : {};
    const slugErrors: Record<string, string[]> = slug.ok ? {} : (slug.error.fieldErrors ?? {});
    return fail(appError("validation", { fieldErrors: { ...others, ...priceErrors, ...slugErrors } }));
}

/** A best-effort offer for the live preview (never fails: placeholders fill empty fields). */
export function previewOffer(values: OfferFormValues, id: string): Offer {
    return {
        id,
        title: values.title.trim() || "اسم العرض",
        items: values.items.length > 0 ? values.items : ["شو بياخد الزبون"],
        freeItem: values.freeItem.trim() || "الهدية",
        price: parsePriceInput(values.price) ?? 0,
        image: values.image ?? "",
        imageStyle: values.imageStyle,
        badge: values.badge.trim() || undefined,
        isActive: values.isActive,
    };
}
