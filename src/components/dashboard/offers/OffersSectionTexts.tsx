"use client";

import FieldShell, { describedBy } from "@/components/dashboard/form/FieldShell";
import HighlightInput from "@/components/dashboard/form/HighlightInput";
import { inputClasses } from "@/components/dashboard/form/field-styles";
import { fieldError, type AppError, type Result } from "@/lib/api/errors";
import { toPlainText } from "@/lib/highlight";
import { SECTION_TEXT_LIMITS } from "@/lib/dashboard/validation";
import { useState, type FormEvent } from "react";
import { FiLoader } from "react-icons/fi";

interface OffersSectionTextsProps {
    eyebrow: string;
    title: string;
    onSave: (texts: { eyebrow: string; title: string }) => Promise<Result<unknown>>;
}

// The offers section's eyebrow and title, saved together with one button that
// shows only after a change. The parent remounts it (key) after a save or a reset.
const OffersSectionTexts = ({ eyebrow: savedEyebrow, title: savedTitle, onSave }: OffersSectionTextsProps) => {
    const [eyebrow, setEyebrow] = useState(savedEyebrow);
    const [title, setTitle] = useState(savedTitle);
    const [error, setError] = useState<AppError>();
    const [isSaving, setIsSaving] = useState(false);
    const isDirty = eyebrow !== savedEyebrow || title !== savedTitle;

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);
        const result = await onSave({ eyebrow: eyebrow.trim(), title: title.trim() });
        setIsSaving(false);
        if (!result.ok) setError(result.error);
    };

    const eyebrowError = fieldError(error, "eyebrow");
    const titleError = fieldError(error, "title");

    return (
        <form onSubmit={submit} noValidate className="flex flex-col gap-14">
            <FieldShell
                htmlFor="offers-eyebrow"
                label="العنوان الصغير"
                error={eyebrowError}
                counter={`${eyebrow.length}/${SECTION_TEXT_LIMITS.eyebrow}`}
            >
                <input
                    id="offers-eyebrow"
                    value={eyebrow}
                    onChange={(event) => setEyebrow(event.target.value)}
                    maxLength={SECTION_TEXT_LIMITS.eyebrow}
                    placeholder="متل: عروض أهل الكرم"
                    aria-invalid={Boolean(eyebrowError)}
                    aria-describedby={describedBy("offers-eyebrow", { error: eyebrowError })}
                    className={inputClasses}
                />
            </FieldShell>

            <FieldShell
                htmlFor="offers-title"
                label="العنوان"
                hint="حدّد كلمة واكبس «ميّز» ليطلع تحتها خط برتقالي."
                error={titleError}
                counter={`${toPlainText(title).length}/${SECTION_TEXT_LIMITS.title}`}
            >
                <HighlightInput
                    id="offers-title"
                    value={title}
                    onChange={setTitle}
                    maxLength={SECTION_TEXT_LIMITS.title}
                    placeholder="متل: الكرم بالعروض"
                    invalid={Boolean(titleError)}
                    describedBy={describedBy("offers-title", { hasHint: true, error: titleError })}
                />
            </FieldShell>

            {(isDirty || isSaving) && (
                <div className="flex gap-8">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex h-44 items-center gap-8 rounded-full bg-primary px-20 font-extrabold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                    >
                        {isSaving && <FiLoader aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
                        {isSaving ? "عم نحفظ…" : "احفظ العناوين"}
                    </button>
                    <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => {
                            setEyebrow(savedEyebrow);
                            setTitle(savedTitle);
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

export default OffersSectionTexts;
