"use client";

import { useState, type KeyboardEvent } from "react";
import { FiPlus, FiX } from "react-icons/fi";

interface ChipsInputProps {
    id: string;
    values: readonly string[];
    onChange: (values: string[]) => void;
    /** Most chips allowed. */
    max: number;
    /** Longest chip, in characters. */
    maxLength: number;
    placeholder?: string;
    describedBy?: string;
    invalid?: boolean;
}

/** "ثوم، مخلل, بطاطا" → ["ثوم", "مخلل", "بطاطا"] (Arabic and Latin commas). */
const splitItems = (text: string) =>
    text
        .split(/[،,]/)
        .map((item) => item.trim())
        .filter(Boolean);

// A list typed one item at a time (ingredients, offer contents). Enter or a
// comma adds; pasting "a، b، c" adds all; Backspace in the empty field removes
// the last; each chip has its own remove button.
const ChipsInput = ({ id, values, onChange, max, maxLength, placeholder, describedBy, invalid }: ChipsInputProps) => {
    const [text, setText] = useState("");
    const isFull = values.length >= max;

    const add = (raw: string) => {
        const items = splitItems(raw).filter((item) => !values.includes(item));
        if (items.length > 0) onChange([...values, ...items].slice(0, max));
        setText("");
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            // Adds the chip instead of submitting the form
            event.preventDefault();
            add(text);
        } else if (event.key === "Backspace" && text === "" && values.length > 0) {
            onChange(values.slice(0, -1));
        }
    };

    return (
        <div
            className={`flex flex-wrap items-center gap-6 rounded-2xl border bg-background p-8 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30 ${
                invalid ? "border-danger" : "border-border"
            }`}
        >
            {values.map((value) => (
                <span
                    key={value}
                    className="inline-flex h-32 items-center gap-4 rounded-full bg-surface ps-12 pe-4 text-sm font-bold"
                >
                    {value}
                    <button
                        type="button"
                        onClick={() => onChange(values.filter((item) => item !== value))}
                        aria-label={`شيل ${value}`}
                        className="flex size-24 items-center justify-center rounded-full text-muted transition-colors hover:bg-danger/15 hover:text-danger"
                    >
                        <FiX aria-hidden="true" />
                    </button>
                </span>
            ))}

            {!isFull && (
                <span className="flex min-w-140 flex-1 items-center gap-4">
                    <input
                        id={id}
                        value={text}
                        onChange={(event) => {
                            const next = event.target.value;
                            // A typed comma ends the item
                            if (/[،,]/.test(next)) add(next);
                            else setText(next.slice(0, maxLength));
                        }}
                        onKeyDown={handleKeyDown}
                        onBlur={() => add(text)}
                        placeholder={values.length === 0 ? placeholder : "ضيف كمان…"}
                        aria-describedby={describedBy}
                        aria-invalid={invalid}
                        enterKeyHint="enter"
                        className="h-32 min-w-0 flex-1 bg-transparent px-6 text-base outline-none placeholder:text-muted/70"
                    />
                    {text.trim() && (
                        <button
                            type="button"
                            onClick={() => add(text)}
                            aria-label={`ضيف ${text.trim()}`}
                            className="flex size-32 shrink-0 items-center justify-center rounded-full bg-primary text-background"
                        >
                            <FiPlus aria-hidden="true" />
                        </button>
                    )}
                </span>
            )}
        </div>
    );
};

export default ChipsInput;
