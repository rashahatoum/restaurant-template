"use client";

import HighlightedText from "@/components/ui/HighlightedText";
import Underline from "@/components/ui/Underline";
import {
    markRange,
    parseMarked,
    parseMarks,
    remark,
    shiftMarks,
    splitHighlights,
    toggleMark,
} from "@/lib/highlight";
import { useRef, useState } from "react";
import { FiEdit3, FiX } from "react-icons/fi";
import { inputClasses, textareaClasses } from "./field-styles";

interface HighlightInputProps {
    id: string;
    /** The text with its **marked** parts, as saved. */
    value: string;
    onChange: (value: string) => void;
    /** Of the plain text (markers don't count). */
    maxLength: number;
    placeholder?: string;
    describedBy?: string;
    invalid?: boolean;
    /**
     * "title" (default): one highlight, underlined, single line.
     * "text": a paragraph, several highlights in the brand color.
     */
    variant?: "title" | "text";
    /** Text variant: the field's height in lines. */
    rows?: number;
}

const highlightButtonClasses =
    "inline-flex h-44 shrink-0 items-center gap-6 rounded-full border border-border bg-background px-14 text-sm font-bold transition-colors hover:border-primary hover:text-primary";

// Text whose highlighted words stand out on the site. The owner never sees
// the ** markers: she types plain text, selects words and taps «ميّز». A
// small preview under the field shows the result.
const HighlightInput = ({
    id,
    value,
    onChange,
    maxLength,
    placeholder,
    describedBy,
    invalid,
    variant = "title",
    rows = 4,
}: HighlightInputProps) => {
    const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
    const [message, setMessage] = useState("");
    const isText = variant === "text";
    // Titles: one highlight that follows its words; text: many, moving with the edits
    const single = parseMarked(value);
    const marks = parseMarks(value);
    const plain = marks.plain;
    const hasHighlight = marks.ranges.length > 0;

    const edit = (next: string) => onChange(isText ? shiftMarks(marks, next) : remark(single, next));

    const highlightSelection = () => {
        const field = fieldRef.current;
        const start = field?.selectionStart ?? 0;
        const end = field?.selectionEnd ?? 0;
        if (end <= start || !plain.slice(start, end).trim()) {
            setMessage(
                isText
                    ? "حدّد الكلمات اللي بدك تميّزها، وبعدين اكبس «ميّز». لتشيل تمييز كلمة، حدّدها واكبس «ميّز» مرة تانية."
                    : "حدّد الكلمة اللي بدك تميّزها بالعنوان، وبعدين اكبس «ميّز»."
            );
            field?.focus();
            return;
        }
        setMessage("");
        // A title has one highlight: a new one replaces the old
        onChange(isText ? toggleMark(marks, { start, end }) : markRange({ plain, start, end }));
    };

    const fieldProps = {
        ref: fieldRef,
        id,
        value: plain,
        onChange: (event: { target: { value: string } }) => edit(event.target.value),
        maxLength,
        placeholder,
        "aria-invalid": invalid,
        "aria-describedby": [describedBy, `${id}-preview`].filter(Boolean).join(" "),
    };

    const highlightButton = (
        <button
            type="button"
            // Keeps the selection on desktop (the field doesn't lose focus)
            onMouseDown={(event) => event.preventDefault()}
            onClick={highlightSelection}
            className={highlightButtonClasses}
        >
            <FiEdit3 aria-hidden="true" />
            ميّز
        </button>
    );

    return (
        <div className="flex flex-col gap-8">
            {isText ? (
                <>
                    {/* Grows with the text where supported (rows is the fallback height) */}
                    <textarea {...fieldProps} rows={rows} className={`${textareaClasses} field-sizing-content min-h-72`} />
                    <div>{highlightButton}</div>
                </>
            ) : (
                <div className="flex gap-8">
                    <input {...fieldProps} className={`${inputClasses} min-w-0`} />
                    {highlightButton}
                </div>
            )}

            {message && (
                <p role="status" className="text-xs font-bold text-primary">
                    {message}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-8 rounded-xl border border-dashed border-border px-12 py-10">
                <p
                    id={`${id}-preview`}
                    className={isText ? "text-sm leading-relaxed text-foreground/85" : "font-display text-xl font-extrabold leading-snug"}
                >
                    <span className="sr-only">{isText ? "شكل النص: " : "شكل العنوان: "}</span>
                    {!plain.trim()
                        ? "…"
                        : isText
                          ? <HighlightedText text={value} />
                          : splitHighlights(value).map((part, index) =>
                                part.highlighted ? (
                                    <span key={index} className="inline-block">
                                        {part.text}
                                        <Underline />
                                    </span>
                                ) : (
                                    part.text
                                )
                            )}
                </p>
                {hasHighlight && (
                    <button
                        type="button"
                        onClick={() => onChange(plain)}
                        className="inline-flex h-32 items-center gap-4 rounded-full px-10 text-xs font-bold text-muted transition-colors hover:text-danger"
                    >
                        <FiX aria-hidden="true" />
                        {isText && marks.ranges.length > 1 ? "شيل كل التمييز" : "شيل التمييز"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default HighlightInput;
