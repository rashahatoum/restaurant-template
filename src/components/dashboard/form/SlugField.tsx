import FieldShell, { describedBy } from "@/components/dashboard/form/FieldShell";
import { inputClasses } from "@/components/dashboard/form/field-styles";
import { SLUG_MAX, tidySlug } from "@/lib/slug";

interface SlugFieldProps {
    id: string;
    /** "رابط الصفحة" or "رابط الفرع". */
    label: string;
    value: string;
    onChange: (value: string) => void;
    /** Shown before the field, left to right: "/menu/". */
    prefix: string;
    /** The help line under the field (what it's for, and what changing it does). */
    hint: string;
    placeholder: string;
    error?: string;
}

// «رابط الصفحة»: an optional Latin link (lib/slug). Tidied when the field is
// left ("Chicken Shawarma" → "chicken-shawarma"). Hook-free: the form holds the value.
const SlugField = ({ id, label, value, onChange, prefix, hint, placeholder, error }: SlugFieldProps) => (
    <FieldShell htmlFor={id} label={label} hint={hint} error={error}>
        <div dir="ltr" className="flex items-center gap-6">
            <span aria-hidden="true" className="shrink-0 text-sm text-muted">
                {prefix}
            </span>
            <input
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onBlur={() => onChange(tidySlug(value))}
                maxLength={SLUG_MAX + 10}
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy(id, { hasHint: true, error })}
                className={`${inputClasses} text-start`}
            />
        </div>
    </FieldShell>
);

export default SlugField;
