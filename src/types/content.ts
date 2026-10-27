// Editable page content (future dashboard). Unlike restaurantConfig, which is
// fixed per deployment, this comes through services/ like the menu.
// Text fields may use **markers** for highlights (see lib/highlight.ts).

export interface ContentImage {
    src: string;
    alt: string;
}

export interface AboutContent {
    eyebrow: string;
    /** The **marked** part gets the brand underline. */
    title: string;
    /** The **marked** words render in the primary color. */
    paragraphs: readonly string[];
    closing: string;
    image: ContentImage;
    /** Optional label over the image. */
    badge?: string;
}
