"use client";

import FieldShell, { describedBy } from "@/components/dashboard/form/FieldShell";
import HighlightInput from "@/components/dashboard/form/HighlightInput";
import { inputClasses } from "@/components/dashboard/form/field-styles";
import { fieldError, type AppError, type Result } from "@/lib/api/errors";
import { SECTION_TEXT_LIMITS } from "@/lib/dashboard/validation";
import { toPlainText } from "@/lib/highlight";
import { useState, type FormEvent } from "react";
import { FiLoader } from "react-icons/fi";

export interface SectionTextValues {
    eyebrow: string;
    title: string;
    /** The extra field's value, when there is one. */
    extra?: string;
}

interface SectionTextsProps {
    /** Prefix of the field ids, e.g. "offers" → "offers-eyebrow". */
    idPrefix: string;
    eyebrow: string;
    title: string;
    placeholders: { eyebrow: string; title: string };
    /** One more plain field saved with the titles (reviews: the default question). */
    extra?: {
        /** Its key in the API's 422 errors. */
        field: string;
        label: string;
        value: string;
        maxLength: number;
        placeholder: string;
        hint?: string;
    };
    onSave: (texts: SectionTextValues) => Promise<Result<unknown>>;
}

// A home section's eyebrow and title (with «ميّز»), plus an optional extra
// field, saved together with one button that shows only after a change. The
// parent remounts it (key) after a save or a reset.
const SectionTexts = ({ idPrefix, eyebrow: savedEyebrow, title: savedTitle, placeholders, extra, onSave }: SectionTextsProps) => {
    const [eyebrow, setEyebrow] = useState(savedEyebrow);
    const [title, setTitle] = useState(savedTitle);
    const [extraValue, setExtraValue] = useState(extra?.value ?? "");
    const [error, setError] = useState<AppError>();
    const [isSaving, setIsSaving] = useState(false);
    const isDirty = eyebrow !== savedEyebrow || title !== savedTitle || (extra !== undefined && extraValue !== extra.value);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);
        const result = await onSave({
            eyebrow: eyebrow.trim(),
            title: title.trim(),
            ...(extra ? { extra: extraValue.trim() } : {}),
        });
        setIsSaving(false);
        if (!result.ok) setError(result.error);
    };

    const ids = { eyebrow: `${idPrefix}-eyebrow`, title: `${idPrefix}-title`, extra: `${idPrefix}-extra` };
    const eyebrowError = fieldError(error, "eyebrow");
    const titleError = fieldError(error, "title");
    const extraError = extra && fieldError(error, extra.field);

    return (
        <form onSubmit={submit} noValidate className="flex flex-col gap-14">
            <FieldShell
                htmlFor={ids.eyebrow}
                label="العنوان الصغير"
                error={eyebrowError}
                counter={`${eyebrow.length}/${SECTION_TEXT_LIMITS.eyebrow}`}
            >
                <input
                    id={ids.eyebrow}
                    value={eyebrow}
                    onChange={(event) => setEyebrow(event.target.value)}
                    maxLength={SECTION_TEXT_LIMITS.eyebrow}
                    placeholder={placeholders.eyebrow}
                    aria-invalid={Boolean(eyebrowError)}
                    aria-describedby={describedBy(ids.eyebrow, { error: eyebrowError })}
                    className={inputClasses}
                />
            </FieldShell>

            <FieldShell
                htmlFor={ids.title}
                label="العنوان"
                hint="حدّد كلمة واكبس «ميّز» ليطلع تحتها خط برتقالي."
                error={titleError}
                counter={`${toPlainText(title).length}/${SECTION_TEXT_LIMITS.title}`}
            >
                <HighlightInput
                    id={ids.title}
                    value={title}
                    onChange={setTitle}
                    maxLength={SECTION_TEXT_LIMITS.title}
                    placeholder={placeholders.title}
                    invalid={Boolean(titleError)}
                    describedBy={describedBy(ids.title, { hasHint: true, error: titleError })}
                />
            </FieldShell>

            {extra && (
                <FieldShell
                    htmlFor={ids.extra}
                    label={extra.label}
                    hint={extra.hint}
                    error={extraError}
                    counter={`${extraValue.length}/${extra.maxLength}`}
                >
                    <input
                        id={ids.extra}
                        value={extraValue}
                        onChange={(event) => setExtraValue(event.target.value)}
                        maxLength={extra.maxLength}
                        placeholder={extra.placeholder}
                        aria-invalid={Boolean(extraError)}
                        aria-describedby={describedBy(ids.extra, { hasHint: Boolean(extra.hint), error: extraError })}
                        className={inputClasses}
                    />
                </FieldShell>
            )}

            {(isDirty || isSaving) && (
                <div className="flex gap-8">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex h-44 items-center gap-8 rounded-full bg-primary px-20 font-extrabold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                        {isSaving && <FiLoader aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
                        {isSaving ? "عم نحفظ…" : "احفظ النصوص"}
                    </button>
                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => {
                            setEyebrow(savedEyebrow);
                            setTitle(savedTitle);
                            setExtraValue(extra?.value ?? "");
                            setError(undefined);
                        }}
                        className="h-44 rounded-full border border-border px-16 font-bold transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                    >
                        تجاهل
                    </button>
                </div>
            )}
        </form>
    );
};

export default SectionTexts;
