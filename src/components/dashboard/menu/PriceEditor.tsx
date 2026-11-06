"use client";

import FieldError from "@/components/dashboard/feedback/FieldError";
import { fieldError, type AppError, type Result } from "@/lib/api/errors";
import { formatPrice } from "@/lib/format-price";
import { parsePriceInput } from "@/lib/dashboard/validation";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { FiCheck, FiEdit2, FiX } from "react-icons/fi";

interface PriceEditorProps {
    price: number;
    /** Product name, for the labels ("سعر شاورما جاج"). */
    itemName: string;
    onSave: (price: number | null) => Promise<Result<unknown>>;
}

// The price as a button; tap → a number field in place. Enter saves, Escape
// cancels. A failed save keeps the typed value and shows why under it.
const PriceEditor = ({ price, itemName, onSave }: PriceEditorProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState("");
    const [error, setError] = useState<AppError>();
    const [isSaving, setIsSaving] = useState(false);
    const errorId = useId();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const returnFocus = useRef(false);

    // The field disappears on save/cancel: put keyboard focus back on the price
    useEffect(() => {
        if (!isEditing && returnFocus.current) {
            returnFocus.current = false;
            buttonRef.current?.focus();
        }
    }, [isEditing]);

    const start = () => {
        setValue(String(price));
        setError(undefined);
        setIsEditing(true);
    };

    const cancel = () => {
        returnFocus.current = true;
        setIsEditing(false);
        setError(undefined);
    };

    const save = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const next = parsePriceInput(value);
        if (next === price) return cancel();

        setIsSaving(true);
        const result = await onSave(next);
        setIsSaving(false);

        if (result.ok) cancel();
        else setError(result.error);
    };

    if (!isEditing) {
        return (
            <button
                ref={buttonRef}
                type="button"
                onClick={start}
                aria-label={`سعر ${itemName}: ${formatPrice(price)}، عدّله`}
                className="inline-flex h-36 items-center gap-6 rounded-full border border-border bg-background px-12 text-sm font-extrabold text-primary tabular-nums transition-colors hover:border-primary"
            >
                {formatPrice(price)}
                <FiEdit2 aria-hidden="true" className="text-xs text-muted" />
            </button>
        );
    }

    const message = error ? (fieldError(error, "price") ?? error.message) : undefined;

    return (
        <form onSubmit={save} className="flex flex-col gap-4">
            <div className="flex items-center gap-6">
                <input
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") cancel();
                    }}
                    inputMode="numeric"
                    autoFocus
                    aria-label={`سعر ${itemName} الجديد`}
                    aria-invalid={Boolean(message)}
                    aria-describedby={message ? errorId : undefined}
                    // Price digits read left to right
                    dir="ltr"
                    className={`h-36 w-104 rounded-full border bg-background px-12 text-center text-base font-bold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 ${
                        message ? "border-danger" : "border-primary"
                    }`}
                />
                <button
                    type="submit"
                    disabled={isSaving}
                    aria-label="احفظ السعر"
                    className="flex size-36 items-center justify-center rounded-full bg-primary text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                    <FiCheck aria-hidden="true" />
                </button>
                <button
                    type="button"
                    onClick={cancel}
                    aria-label="إلغاء"
                    className="flex size-36 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-foreground"
                >
                    <FiX aria-hidden="true" />
                </button>
            </div>
            <FieldError id={errorId} message={message} />
        </form>
    );
};

export default PriceEditor;
