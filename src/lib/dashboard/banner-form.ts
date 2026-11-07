// The banner slide form's model and the button-target helpers the dashboard
// needs (what a target is called, whether customers can still reach it). Pure.

import { bannerHref, type BannerTargets } from "@/lib/banner";
import type { BannerTarget, MenuBanner, MenuBannerSlideData } from "@/types/content";
import type { BannerInput, DashboardData } from "@/types/dashboard";

export type TargetKind = BannerTarget["kind"];

export interface BannerFormValues {
    eyebrow: string;
    title: string;
    image?: string;
    hasAction: boolean;
    actionLabel: string;
    targetKind: TargetKind;
    /** Kept while another kind is picked, so switching back doesn't lose it. */
    categoryId: string;
    productId: string;
    isActive: boolean;
}

export function toBannerFormValues(banner: MenuBanner | undefined, defaults: { categoryId: string; productId: string }): BannerFormValues {
    const target = banner?.action?.target;
    return {
        eyebrow: banner?.eyebrow ?? "",
        title: banner?.title ?? "",
        image: banner?.image.src || undefined,
        hasAction: banner ? Boolean(banner.action) : true,
        actionLabel: banner?.action?.label ?? "",
        targetKind: target?.kind ?? "offers",
        categoryId: target?.kind === "category" ? target.categoryId : defaults.categoryId,
        productId: target?.kind === "product" ? target.productId : defaults.productId,
        isActive: banner?.isActive ?? true,
    };
}

export const isSameBannerForm = (a: BannerFormValues, b: BannerFormValues) => JSON.stringify(a) === JSON.stringify(b);

function toTarget(values: BannerFormValues): BannerTarget {
    switch (values.targetKind) {
        case "offers":
            return { kind: "offers" };
        case "category":
            return { kind: "category", categoryId: values.categoryId };
        case "product":
            return { kind: "product", productId: values.productId };
    }
}

/** Trailing spaces per line and empty lines out; the rules are checkBannerInput's. */
const cleanTitle = (title: string) =>
    title
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .join("\n");

/** Form → payload. Nothing to parse (no numbers), so it can't fail; the repository checks the rules. */
export function toBannerInput(values: BannerFormValues): BannerInput {
    const title = cleanTitle(values.title);
    const eyebrow = values.eyebrow.trim();
    return {
        ...(eyebrow ? { eyebrow } : {}),
        title,
        // Screen readers get the title (no extra field for the owner)
        image: { src: values.image ?? "", alt: title.replace(/\n/g, " ") },
        ...(values.hasAction ? { action: { label: values.actionLabel.trim(), target: toTarget(values) } } : {}),
        isActive: values.isActive,
    };
}

/** What customers can reach in the dashboard's data (same rules as services/menu). */
export function bannerTargetsFromData(data: DashboardData): BannerTargets {
    const categoryIds = new Set(data.categories.map((category) => category.id));
    const shownProducts = data.products.filter((product) => categoryIds.has(product.categoryId));
    return {
        hasOffers: data.offers.isEnabled && data.offers.offers.some((offer) => offer.isActive),
        // Empty categories are left out of the menu
        categoryIds: new Set(shownProducts.map((product) => product.categoryId)),
        productIds: new Set(shownProducts.map((product) => product.id)),
    };
}

/** The target in words, and why the button is hidden when it can't be reached. */
export function describeTarget(target: BannerTarget, data: DashboardData): { name: string; hiddenBecause?: string } {
    const href = bannerHref(target, bannerTargetsFromData(data));
    switch (target.kind) {
        case "offers":
            return { name: "العروض", hiddenBecause: href ? undefined : "قسم العروض مطفي أو ما فيه عروض فعّالة" };
        case "category": {
            const category = data.categories.find((candidate) => candidate.id === target.categoryId);
            if (!category) return { name: "قسم", hiddenBecause: "القسم انحذف" };
            return { name: `قسم ${category.name}`, hiddenBecause: href ? undefined : "القسم فاضي" };
        }
        case "product": {
            const product = data.products.find((candidate) => candidate.id === target.productId);
            return product ? { name: product.name } : { name: "صنف", hiddenBecause: "الصنف انحذف" };
        }
    }
}

/** The slide as the menu will show it (the button only when its target is reachable). */
export function previewBanner(values: BannerFormValues, id: string, data: DashboardData): MenuBannerSlideData {
    const input = toBannerInput(values);
    const href = input.action && bannerHref(input.action.target, bannerTargetsFromData(data));
    return {
        id,
        eyebrow: input.eyebrow,
        title: input.title || "عنوان الشريحة",
        image: input.image,
        ...(input.action && href ? { action: { label: input.action.label || "نص الزر", href } } : {}),
        isActive: input.isActive,
    };
}
