// The hero and «من نحن» forms' values, pure: what the fields hold, and the
// input the repository saves (the API payload later).

import { toPlainText } from "@/lib/highlight";
import type { AboutContent, HeroContent } from "@/types/content";

/* =========================
   HERO
========================= */

export type HeroFormValues = Omit<HeroContent, "badge" | "features"> & {
    badge: string;
    features: HeroContent["features"][number][];
};

export const toHeroFormValues = (hero: HeroContent): HeroFormValues => ({
    ...hero,
    badge: hero.badge ?? "",
    features: hero.features.map((feature) => ({ ...feature })),
});

export function toHeroInput(values: HeroFormValues): HeroContent {
    const badge = values.badge.trim();
    return {
        ...(badge ? { badge } : {}),
        headline: values.headline.trim(),
        primaryActionLabel: values.primaryActionLabel.trim(),
        secondaryActionLabel: values.secondaryActionLabel.trim(),
        features: values.features.map((feature) => ({ label: feature.label.trim(), icon: feature.icon })),
    };
}

/* =========================
   ABOUT
========================= */

export interface AboutFormValues {
    eyebrow: string;
    title: string;
    /** `key` keeps each field in place when one above it is deleted. */
    paragraphs: { key: number; text: string }[];
    closing: string;
    imageSrc?: string;
    badge: string;
}

export const toAboutFormValues = (about: AboutContent): AboutFormValues => ({
    eyebrow: about.eyebrow,
    title: about.title,
    paragraphs: about.paragraphs.map((text, key) => ({ key, text })),
    closing: about.closing,
    imageSrc: about.image.src,
    badge: about.badge ?? "",
});

/** `saved` gives the current photo's description: kept while the photo stays, else taken from the title. */
export function toAboutInput(values: AboutFormValues, saved: AboutContent): AboutContent {
    const badge = values.badge.trim();
    const src = values.imageSrc ?? "";
    return {
        eyebrow: values.eyebrow.trim(),
        title: values.title.trim(),
        paragraphs: values.paragraphs.map((paragraph) => paragraph.text.trim()),
        closing: values.closing.trim(),
        image: { src, alt: src === saved.image.src ? saved.image.alt : toPlainText(values.title).trim() },
        ...(badge ? { badge } : {}),
    };
}

/** Same saved content (key order is fixed by the builders above). */
export const isSameContent = (a: HeroContent | AboutContent, b: HeroContent | AboutContent) =>
    JSON.stringify(a) === JSON.stringify(b);
