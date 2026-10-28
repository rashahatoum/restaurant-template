// Editable page content (future dashboard). Unlike restaurantConfig, which is
// fixed per deployment, this comes through services/ like the menu.
// Text fields may use **markers** for highlights (see lib/highlight.ts).

export interface ContentImage {
    src: string;
    alt: string;
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
