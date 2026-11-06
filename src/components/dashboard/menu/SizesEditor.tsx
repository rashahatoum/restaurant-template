import FieldError from "@/components/dashboard/feedback/FieldError";
import { inputClasses } from "@/components/dashboard/form/field-styles";
import type { SizeRow } from "@/lib/dashboard/product-form";
import { PRODUCT_LIMITS } from "@/lib/dashboard/validation";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface SizesEditorProps {
    sizes: readonly SizeRow[];
    onChange: (sizes: SizeRow[]) => void;
    /** Error for a size field (see sizeField), if any. */
    errorFor: (index: number, field: "name" | "shortName" | "priceDelta") => string | undefined;
    /** Error about the list as a whole ("two sizes or more"). */
    listError?: string;
    /** Makes ids for new rows (they must stay stable: carts refer to them). */
    newRowId: () => string;
    /** The product price, given to the first size when sizes are turned on. */
    basePrice: string;
}

// Sizes with their full prices (owner: no "extra" maths). The first size is the
// one preselected on the menu. Presentational: the form owns the rows.
const SizesEditor = ({ sizes, onChange, errorFor, listError, newRowId, basePrice }: SizesEditorProps) => {
    const update = (index: number, changes: Partial<SizeRow>) =>
        onChange(sizes.map((row, rowIndex) => (rowIndex === index ? { ...row, ...changes } : row)));

    const addRow = () =>
        onChange(
            sizes.length === 0
                ? // Turning sizes on: the regular one plus one to fill in
                  [
                      { id: newRowId(), name: "عادي", shortName: "", price: basePrice },
                      { id: newRowId(), name: "", shortName: "", price: "" },
                  ]
                : [...sizes, { id: newRowId(), name: "", shortName: "", price: "" }]
        );

    return (
        <div className="flex flex-col gap-12">
            <p className="text-xs leading-relaxed text-muted">
                اكتب سعر كل حجم كامل، متل «دبل» 350. أول حجم بيطلع مختار تلقائياً بالمنيو.
                الاسم المختصر بيطلع عالموبايل إذا الاسم طويل.
            </p>

            {sizes.length > 0 && (
                <ol className="flex flex-col gap-10">
                    {sizes.map((row, index) => {
                        const base = `size-${row.id}`;
                        const nameError = errorFor(index, "name");
                        const shortError = errorFor(index, "shortName");
                        const priceError = errorFor(index, "priceDelta");

                        return (
                            <li key={row.id} className="flex flex-col gap-8 rounded-2xl border border-border bg-background/50 p-10">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-muted">
                                        {index === 0 ? "الحجم الأول (المختار تلقائياً)" : `حجم ${index + 1}`}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onChange(sizes.filter((_, rowIndex) => rowIndex !== index))}
                                        aria-label={`شيل الحجم ${row.name || index + 1}`}
                                        className="flex size-32 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/15 hover:text-danger"
                                    >
                                        <FiTrash2 aria-hidden="true" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-8 md:grid-cols-[2fr_1fr_1fr]">
                                    <label className="col-span-2 flex flex-col gap-4 text-xs font-bold md:col-span-1">
                                        الاسم
                                        <input
                                            value={row.name}
                                            onChange={(event) => update(index, { name: event.target.value })}
                                            maxLength={PRODUCT_LIMITS.sizeName}
                                            placeholder="متل: دبل"
                                            aria-invalid={Boolean(nameError)}
                                            aria-describedby={nameError ? `${base}-name-error` : undefined}
                                            className={inputClasses}
                                        />
                                        <FieldError id={`${base}-name-error`} message={nameError} />
                                    </label>
                                    <label className="flex flex-col gap-4 text-xs font-bold">
                                        مختصر (اختياري)
                                        <input
                                            value={row.shortName}
                                            onChange={(event) => update(index, { shortName: event.target.value })}
                                            maxLength={PRODUCT_LIMITS.sizeShortName}
                                            aria-invalid={Boolean(shortError)}
                                            aria-describedby={shortError ? `${base}-short-error` : undefined}
                                            className={inputClasses}
                                        />
                                        <FieldError id={`${base}-short-error`} message={shortError} />
                                    </label>
                                    <label className="flex flex-col gap-4 text-xs font-bold">
                                        السعر (ل.س)
                                        <input
                                            value={row.price}
                                            onChange={(event) => update(index, { price: event.target.value })}
                                            inputMode="numeric"
                                            dir="ltr"
                                            placeholder="350"
                                            aria-invalid={Boolean(priceError)}
                                            aria-describedby={priceError ? `${base}-price-error` : undefined}
                                            className={`${inputClasses} text-center tabular-nums`}
                                        />
                                        <FieldError id={`${base}-price-error`} message={priceError} />
                                    </label>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            )}

            <FieldError id="sizes-error" message={listError} />

            <button
                type="button"
                onClick={addRow}
                className="inline-flex h-40 items-center gap-6 self-start rounded-full border border-dashed border-border px-14 text-sm font-bold transition-colors hover:border-primary hover:text-primary"
            >
                <FiPlus aria-hidden="true" />
                {sizes.length === 0 ? "ضيف أحجام بأسعار مختلفة" : "ضيف حجم"}
            </button>
        </div>
    );
};

export default SizesEditor;
