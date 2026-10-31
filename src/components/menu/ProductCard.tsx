import { formatPrice } from "@/lib/format-price";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
    name: string;
    description: string;
    /** Square image of the dish on a transparent background (round plate). */
    image: string;
    price: number;
    /** When set, the whole card links there. */
    href?: string;
}

// Presentational and borderless; the parent decides layout and size.
const ProductCard = ({
    name,
    description,
    image,
    price,
    href,
}: ProductCardProps) => {
    const content = (
        <>
            <Image
                src={image}
                alt={name}
                width={500}
                height={500}
                sizes="(min-width: 768px) 33vw, 80vw"
                className="aspect-square w-full object-contain drop-shadow-[0_16px_24px_rgb(0_0_0/0.5)] transition-transform duration-500 group-hover:rotate-6 motion-reduce:transition-none"
            />

            <div className="flex flex-col items-center gap-8 text-center">
                <h3 className="font-display text-2xl font-bold lg:text-3xl">
                    {name}
                </h3>

                <p className="line-clamp-2 text-sm leading-relaxed text-muted lg:text-base">
                    {description}
                </p>

                <p className="text-xl font-extrabold text-primary lg:text-2xl">
                    {formatPrice(price)}
                </p>
            </div>
        </>
    );

    const classes = "group flex w-full flex-col items-center gap-16";

    return href ? (
        // scroll={false}: item pages open as a modal over the current page
        <Link href={href} scroll={false} className={classes}>
            {content}
        </Link>
    ) : (
        <article className={classes}>{content}</article>
    );
};

export default ProductCard;
