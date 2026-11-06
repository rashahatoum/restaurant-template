"use client";

import FieldError from "@/components/dashboard/feedback/FieldError";
import { fieldError, type AppError, type Result } from "@/lib/api/errors";
import { useEffect, useId, useRef, useState, type FormEvent, type HTMLAttributes, type ReactNode } from "react";
import { FiCheck, FiX } from "react-icons/fi";

interface InlineEditorProps {
    /** Text the field starts with. */
    value: string;
    /** What the button shows when not editing. */
    children: ReactNode;
    /** The button's accessible name, e.g. "سعر شاورما جاج: 250 ل.س، عدّله". */
    editLabel: string;
    /** The field's accessible name. */
    inputLabel: string;
    /** "احفظ السعر", "احفظ الاسم". */
    saveLabel: string;
    /** Error key to read from a validation error ("price", "name"). */
    field: string;
    /** Same value as now: close without saving. */
    isUnchanged: (text: string) => boolean;
    onSave: (text: string) => Promise<Result<unknown>>;
    buttonClassName: string;
    /** Width and alignment of the field. */
    inputClassName: string;
    /** E.g. "w-full" so a long text gets the whole line while editing (category names). */
    formClassName?: string;
    inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
    dir?: "ltr" | "rtl";
    maxLength?: number;
}

// A value shown as a button; tap → a field in place. Enter saves, Escape
// cancels, focus returns to the button. A failed save keeps the typed text
// and shows why under it. Used for prices (PriceEditor) and category names.
const InlineEditor = ({
    value,
    children,
    editLabel,
    inputLabel,
    saveLabel,
    field,
    isUnchanged,
    onSave,
    buttonClassName,
    inputClassName,
    formClassName = "",
    inputMode,
    dir,
    maxLength,
}: InlineEditorProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState("");
    const [error, setError] = useState<AppError>();
    const [isSaving, setIsSaving] = useState(false);
    const errorId = useId();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const returnFocus = useRef(false);

    // The field disappears on save/cancel: put keyboard focus back on the button
    useEffect(() => {
        if (!isEditing && returnFocus.current) {
            returnFocus.current = false;
            buttonRef.current?.focus();
        }
    }, [isEditing]);

    const start = () => {
        setText(value);
        setError(undefined);
        setIsEditing(true);
    };

    const close = () => {
        returnFocus.current = true;
        setIsEditing(false);
        setError(undefined);
    };

    const save = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isUnchanged(text)) return close();

        setIsSaving(true);
        const result = await onSave(text);
        setIsSaving(false);

        if (result.ok) close();
        else setError(result.error);
    };

    if (!isEditing) {
        return (
            <button ref={buttonRef} type="button" onClick={start} aria-label={editLabel} className={buttonClassName}>
                {children}
            </button>
        );
    }

    const message = error ? (fieldError(error, field) ?? error.message) : undefined;

    return (
        <form onSubmit={save} className={`flex flex-col gap-4 ${formClassName}`}>
            <div className="flex items-center gap-6">
                <input
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") close();
                    }}
                    inputMode={inputMode}
                    dir={dir}
                    maxLength={maxLength}
                    autoFocus
                    aria-label={inputLabel}
                    aria-invalid={Boolean(message)}
                    aria-describedby={message ? errorId : undefined}
                    className={`h-36 rounded-full border bg-background px-12 text-base font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                        message ? "border-danger" : "border-primary"
                    } ${inputClassName}`}
                />
                <button
                    type="submit"
                    disabled={isSaving}
                    aria-label={saveLabel}
                    className="flex size-36 shrink-0 items-center justify-center rounded-full bg-primary text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                    <FiCheck aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={close}
                    aria-label="إلغاء"
                    className="flex size-36 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground"
                >
                    <FiX aria-hidden="true" />
                </button>
            </div>
            <FieldError id={errorId} message={message} />
        </form>
    );
};

export default InlineEditor;
