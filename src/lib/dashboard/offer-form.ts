// The offer form's model, pure (same idea as product-form.ts): the price stays
// text while typing and is parsed only on save.

import { appError, fail, ok, type Result } from "@/lib/api/errors";
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
export function parseOfferForm(values: OfferFormValues): Result<OfferInput> {
    const price = parsePriceInput(values.price);
    if (price !== null) return ok(toInput(values, price));

    // A valid stand-in price, so only the other fields are reported from this check
    const others = checkOfferInput(toInput(values, 1))?.fieldErrors ?? {};
    const message = values.price.trim() ? "السعر لازم يكون رقم، متل 1000" : "اكتب السعر";
    return fail(appError("validation", { fieldErrors: { ...others, price: [message] } }));
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
