import { restaurantConfig } from "@/config/restaurant";
import type { Metadata } from "next";

type OpenGraph = NonNullable<Metadata["openGraph"]>;
type OpenGraphImage = { url: string; width?: number; height?: number; alt?: string };

const { name, seo } = restaurantConfig;

/** The brand's default link-preview image. */
export const defaultShareImage: OpenGraphImage = {
    url: seo.shareImage.src,
    width: seo.shareImage.width,
    height: seo.shareImage.height,
    alt: seo.shareImage.alt,
};

/** Open Graph fields every page shares. */
export const baseOpenGraph = {
    siteName: name,
    locale: seo.locale,
    type: "website",
} satisfies OpenGraph;

interface PageMetadataInput {
    /** Page title; without it the layout's default title is used (home). */
    title?: string;
    description: string;
    /** Canonical path, e.g. "/menu". */
    path: string;
    /** Page-specific preview image; the brand default otherwise. */
    image?: OpenGraphImage;
}

// A page's openGraph replaces the layout's whole object (Next doesn't merge
// it), so every page builds it here from the shared fields.
export function pageMetadata({ title, description, path, image }: PageMetadataInput): Metadata {
    const fullTitle = title ? `${title} | ${name}` : `${name} | ${seo.title}`;

    return {
        ...(title && { title }),
        description,
        alternates: { canonical: path },
        openGraph: {
            ...baseOpenGraph,
            title: fullTitle,
            description,
            url: path,
            images: [image ?? defaultShareImage],
        },
    };
}
