import InlineEditor from "@/components/dashboard/form/InlineEditor";
import type { Result } from "@/lib/api/errors";
import { parsePriceInput } from "@/lib/dashboard/validation";
import { formatPrice } from "@/lib/format-price";
import { FiEdit2 } from "react-icons/fi";

interface PriceEditorProps {
    price: number;
    /** Product name, for the labels ("سعر شاورما جاج"). */
    itemName: string;
    /** Receives the parsed price, or null for text that isn't a number. */
    onSave: (price: number | null) => Promise<Result<unknown>>;
}

// The price in the product list, editable in place (see InlineEditor).
// Hook-free: the editing state lives in InlineEditor.
const PriceEditor = ({ price, itemName, onSave }: PriceEditorProps) => {
    return (
        <InlineEditor
            value={String(price)}
            editLabel={`سعر ${itemName}: ${formatPrice(price)}، عدّله`}
            inputLabel={`سعر ${itemName} الجديد`}
            saveLabel="احفظ السعر"
            field="price"
            isUnchanged={(text) => parsePriceInput(text) === price}
            onSave={(text) => onSave(parsePriceInput(text))}
            inputMode="numeric"
            // Price digits read left to right
            dir="ltr"
            buttonClassName="inline-flex h-36 items-center gap-6 rounded-full border border-border bg-background px-12 text-sm font-extrabold text-primary tabular-nums transition-colors hover:border-primary"
            inputClassName="w-104 text-center tabular-nums"
        >
            {formatPrice(price)}
            <FiEdit2 aria-hidden="true" className="text-xs text-muted" />
        </InlineEditor>
    );
};

export default PriceEditor;
