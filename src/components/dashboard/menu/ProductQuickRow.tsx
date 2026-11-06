import DashboardImage from "@/components/dashboard/DashboardImage";
import Switch from "@/components/dashboard/Switch";
import type { Result } from "@/lib/api/errors";
import type { ProductQuickChanges } from "@/lib/dashboard/validation";
import type { Product } from "@/types/menu";
import Link from "next/link";
import { FaRegStar, FaStar } from "react-icons/fa";
import { FiChevronLeft } from "react-icons/fi";
import PriceEditor from "./PriceEditor";

interface ProductQuickRowProps {
    product: Product;
    /** Saves one quick change; the parent shows the toast with undo. */
    onChange: (product: Product, changes: ProductQuickChanges) => Promise<Result<unknown>>;
    /** Price typed but not a number: the parent turns it into a validation error. */
    onPriceChange: (product: Product, price: number | null) => Promise<Result<unknown>>;
}

// One product with the three things owners change most, without a form:
// price, available, best seller.
const ProductQuickRow = ({ product, onChange, onPriceChange }: ProductQuickRowProps) => {
    const { name, image, imageStyle, price, isAvailable, isBestSeller, optionGroups } = product;
    const hasSizes = Boolean(optionGroups?.some((group) => group.options.length > 1));

    return (
        <article
            className={`flex items-start gap-12 rounded-2xl border border-border bg-surface p-12 transition-opacity ${
                isAvailable ? "" : "opacity-60"
            }`}
        >
            {/* DashboardImage: the only client part here (photos added on this device live in IndexedDB) */}
            <div className="relative size-56 shrink-0">
                <DashboardImage
                    src={image}
                    sizes="56px"
                    className={imageStyle === "photo" ? "rounded-xl object-cover" : "object-contain"}
                />
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-8">
                <h3 className="flex flex-wrap items-baseline gap-x-6 text-base leading-snug font-extrabold">
                    {/* The full form: everything the quick controls don't cover */}
                    <Link
                        href={`/dashboard/menu/${product.id}`}
                        className="inline-flex items-center gap-4 underline-offset-4 transition-colors hover:text-primary hover:underline"
                    >
                        {name}
                        <FiChevronLeft aria-hidden="true" className="text-sm text-muted ltr:rotate-180" />
                    </Link>
                    {hasSizes && <span className="text-xs font-bold text-muted">(إله أحجام)</span>}
                    {!isAvailable && <span className="text-xs font-bold text-danger">غير متوفر</span>}
                </h3>

                <div className="flex flex-wrap items-center gap-x-12 gap-y-8">
                    <PriceEditor price={price} itemName={name} onSave={(next) => onPriceChange(product, next)} />

                    <Switch
                        checked={isAvailable}
                        label="متوفر"
                        onChange={(checked) => onChange(product, { isAvailable: checked })}
                    />

                    <button
                        type="button"
                        aria-pressed={isBestSeller}
                        onClick={() => onChange(product, { isBestSeller: !isBestSeller })}
                        className={`inline-flex h-36 items-center gap-6 rounded-full border px-12 text-sm font-bold transition-colors ${
                            isBestSeller
                                ? "border-primary/50 bg-primary/15 text-primary"
                                : "border-border text-muted hover:text-foreground"
                        }`}
                    >
                        {isBestSeller ? <FaStar aria-hidden="true" /> : <FaRegStar aria-hidden="true" />}
                        الأكثر مبيعاً
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ProductQuickRow;
