import FieldError from "@/components/dashboard/feedback/FieldError";
import { inputClasses } from "@/components/dashboard/form/field-styles";
import type { TargetKind } from "@/lib/dashboard/banner-form";
import type { Category, Product } from "@/types/menu";

interface BannerTargetFieldsProps {
    kind: TargetKind;
    categoryId: string;
    productId: string;
    categories: readonly Category[];
    products: readonly Product[];
    onKindChange: (kind: TargetKind) => void;
    onCategoryChange: (id: string) => void;
    onProductChange: (id: string) => void;
    error?: string;
    /** Why customers won't see the button now (target off, empty or gone). */
    hiddenBecause?: string;
    /** The offers section is off (or has no active offer): its option looks switched off. */
    offersOff?: boolean;
}

const chipClasses =
    "inline-flex h-40 items-center gap-6 rounded-full border border-border px-16 text-sm font-bold text-muted transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary";
const chipOn = "peer-checked:border-primary peer-checked:bg-primary/15 peer-checked:text-primary";
// Picked but switched off: grey like a switch that's off, never brand orange
const chipOff = "opacity-60 peer-checked:border-muted peer-checked:bg-border/60 peer-checked:text-foreground";

const KINDS: { value: TargetKind; label: string }[] = [
    { value: "offers", label: "العروض" },
    { value: "category", label: "قسم" },
    { value: "product", label: "صنف" },
];

// Where the button goes, picked from lists (no typed links): offers, a
// category, or a product (grouped by category). Native radios and selects,
// hook-free; the form holds the values.
const BannerTargetFields = ({
    kind,
    categoryId,
    productId,
    categories,
    products,
    onKindChange,
    onCategoryChange,
    onProductChange,
    error,
    hiddenBecause,
    offersOff = false,
}: BannerTargetFieldsProps) => {
    return (
        <fieldset className="flex flex-col gap-8" aria-describedby={error ? "banner-target-error" : undefined}>
            <legend className="mb-6 text-sm font-bold">الزر بيودّي على</legend>

            <div className="flex flex-wrap gap-8">
                {KINDS.map((option) => {
                    const isOff = option.value === "offers" && offersOff;
                    return (
                        <label key={option.value} className="cursor-pointer">
                            <input
                                type="radio"
                                name="banner-target-kind"
                                value={option.value}
                                checked={kind === option.value}
                                onChange={() => onKindChange(option.value)}
                                className="peer sr-only"
                            />
                            <span className={`${chipClasses} ${isOff ? chipOff : chipOn}`}>
                                {option.label}
                                {isOff && <span className="text-xs font-bold">· مطفية</span>}
                            </span>
                        </label>
                    );
                })}
            </div>

            {kind === "category" && (
                <select
                    aria-label="القسم"
                    value={categoryId}
                    onChange={(event) => onCategoryChange(event.target.value)}
                    aria-invalid={Boolean(error)}
                    className={`${inputClasses} cursor-pointer`}
                >
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </select>
            )}

            {kind === "product" && (
                <select
                    aria-label="الصنف"
                    value={productId}
                    onChange={(event) => onProductChange(event.target.value)}
                    aria-invalid={Boolean(error)}
                    className={`${inputClasses} cursor-pointer`}
                >
                    {categories.map((category) => {
                        const items = products.filter((product) => product.categoryId === category.id);
                        return items.length > 0 ? (
                            <optgroup key={category.id} label={category.name}>
                                {items.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </optgroup>
                        ) : null;
                    })}
                </select>
            )}

            {hiddenBecause && !error && (
                <p className="text-xs font-bold text-muted">الزر رح يكون مخفي عن الزبون هلق: {hiddenBecause}.</p>
            )}
            <FieldError id="banner-target-error" message={error} />
        </fieldset>
    );
};

export default BannerTargetFields;
