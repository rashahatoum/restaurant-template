"use client";

import FieldShell, { describedBy } from "@/components/dashboard/form/FieldShell";
import { textareaClasses } from "@/components/dashboard/form/field-styles";
import { PLACEHOLDERS, toSavedText } from "@/lib/dashboard/ordering-form";
import { useRef } from "react";
import { FiPlus } from "react-icons/fi";

interface TemplateFieldProps {
    id: string;
    label: string;
    hint?: string;
    value: string;
    onChange: (value: string) => void;
    /** Counted on the saved text (what the API checks). */
    maxLength: number;
    placeholder?: string;
    error?: string;
}

// A message text with buttons that put {اسم المطعم} / {اسم الزبون} where the
// cursor is (at the end when the field wasn't focused yet).
const TemplateField = ({ id, label, hint, value, onChange, maxLength, placeholder, error }: TemplateFieldProps) => {
    const ref = useRef<HTMLTextAreaElement>(null);

    const insert = (token: string) => {
        const field = ref.current;
        const start = field?.selectionStart ?? value.length;
        const end = field?.selectionEnd ?? value.length;
        onChange(value.slice(0, start) + token + value.slice(end));
        // After React writes the new value: caret right after the inserted name
        requestAnimationFrame(() => {
            field?.focus();
            field?.setSelectionRange(start + token.length, start + token.length);
        });
    };

    return (
        <FieldShell htmlFor={id} label={label} hint={hint} error={error} counter={`${toSavedText(value).length}/${maxLength}`}>
            <textarea
                ref={ref}
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                rows={2}
                placeholder={placeholder}
                aria-invalid={Boolean(error)}
                aria-describedby={describedBy(id, { hasHint: Boolean(hint), error })}
                className={`${textareaClasses} field-sizing-content min-h-72`}
            />
            <div className="flex flex-wrap gap-6" role="group" aria-label={`ضيف لـ«${label}»`}>
                {PLACEHOLDERS.map((placeholder) => (
                    <button
                        key={placeholder.saved}
                        type="button"
                        onClick={() => insert(placeholder.shown)}
                        className="inline-flex h-32 items-center gap-4 rounded-full border border-border px-10 text-xs font-bold transition-colors hover:border-primary hover:text-primary"
                    >
                        <FiPlus aria-hidden="true" />
                        {placeholder.label}
                    </button>
                ))}
            </div>
        </FieldShell>
    );
};

export default TemplateField;
