// Editable page content (future dashboard). Unlike restaurantConfig, which is
// fixed per deployment, this comes through services/ like the menu.
// Text fields may use **markers** for highlights (see lib/highlight.ts).

export interface ContentImage {
    src: string;
    alt: string;
}

export interface ContactPhone {
    /** International format, no spaces: "+963930539614". */
    number: string;
    hasWhatsApp: boolean;
}

export interface Branch {
    id: string;
    name: string;
    address: string;
    /** Google Maps (or similar) link, once the branch is listed. */
    mapUrl?: string;
}

export type SocialPlatform = "facebook" | "instagram" | "tiktok";

/** Restaurant contact & location info, shown in the footer (and used for orders later). */
export interface SiteInfo {
    tagline: string;
    phones: readonly ContactPhone[];
    branches: readonly Branch[];
    openingHours?: string;
    socialLinks?: readonly { platform: SocialPlatform; url: string }[];
}

/** "Buy X, get Y free" offer. Shown only while isActive. */
export interface Offer {
    id: string;
    title: string;
    /** What the customer buys. */
    items: readonly string[];
    /** What they get for free. */
    freeItem: string;
    /** Total paid, in the restaurant currency. */
    price: number;
    /** 4:3 photo on a transparent background. */
    image: string;
    /** Optional label, e.g. "الأكثر طلباً". */
    badge?: string;
    isActive: boolean;
}

export interface OffersContent {
    /** Turns the whole home section on or off. */
    isEnabled: boolean;
    eyebrow: string;
    /** The **marked** part gets the brand underline. */
    title: string;
    offers: readonly Offer[];
}

/** A customer review received on WhatsApp, re-typed as a two-message chat. */
export interface Review {
    id: string;
    /** First name only (privacy). */
    customerName: string;
    /** Restaurant's question; falls back to ReviewsContent.defaultQuestion. */
    question?: string;
    /** Customer's reply; **marked** words render in the primary color. */
    answer: string;
    /** Display-only time of the reply, e.g. "9:41 م". */
    time?: string;
    isVisible: boolean;
}

export interface ReviewsContent {
    /** Turns the whole home section on or off. */
    isEnabled: boolean;
    eyebrow: string;
    /** The **marked** part gets the brand underline. */
    title: string;
    defaultQuestion: string;
    reviews: readonly Review[];
}

/**
 * One slide of the menu page banner. The text is real HTML over the photo
 * (editable, sharp on every screen), not baked into the image.
 */
export interface MenuBanner {
    id: string;
    /** Small label above the title, e.g. "عرض الأسبوع". */
    eyebrow?: string;
    /** Short; typed line breaks are kept. */
    title: string;
    /** Dish photo on a transparent background (like offer images). */
    image: ContentImage;
    action?: { label: string; href: string };
    isActive: boolean;
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
