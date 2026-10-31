import Image from "next/image";

export interface CategoryCardItem {
    /** Section id on the same page; the card links to `#id`. */
    id: string;
    label: string;
    /** Full photo, cropped to fill the square card. */
    image?: string;
    /**
     * Used when there's no `image`: a cut-out photo on a transparent
     * background (e.g. a product), shown whole over the tinted card.
     */
    fallbackImage?: string;
}

interface CategoryCardsProps {
    items: readonly CategoryCardItem[];
    /** Accessible name of the list. */
    label: string;
}

const imageSizes = "(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 33vw";

// Category photo cards that wrap onto new rows (never sideways scroll), so
// every category is visible however many the dashboard adds.
// Plain anchor links: they work without JS and use the page's smooth scroll.
const CategoryCards = ({ items, label }: CategoryCardsProps) => {
    return (
        <nav aria-label={label}>
            <ul className="grid grid-cols-3 gap-8 md:grid-cols-4 md:gap-14 lg:grid-cols-6">
                {items.map((item) => (
                    <li key={item.id}>
                        <a
                            href={`#${item.id}`}
                            className="group relative flex aspect-square items-end overflow-hidden rounded-2xl border border-border/60 bg-linear-to-br from-primary/25 to-surface transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt=""
                                    fill
                                    sizes={imageSizes}
                                    className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                                />
                            ) : (
                                item.fallbackImage && (
                                    // Leaves room at the bottom for the name
                                    <Image
                                        src={item.fallbackImage}
                                        alt=""
                                        fill
                                        sizes={imageSizes}
                                        className="object-contain p-8 pb-32 transition-transform duration-300 motion-safe:group-hover:scale-105 md:pb-44"
                                    />
                                )
                            )}

                            {/* Keeps the name readable on any photo */}
                            {(item.image || item.fallbackImage) && (
                                <span
                                    aria-hidden="true"
                                    className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"
                                />
                            )}

                            <span
                                className={`relative w-full p-8 text-sm font-bold md:p-12 md:text-lg ${
                                    item.image || item.fallbackImage ? "text-white" : "text-foreground"
                                }`}
                            >
                                {item.label}
                            </span>
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default CategoryCards;
