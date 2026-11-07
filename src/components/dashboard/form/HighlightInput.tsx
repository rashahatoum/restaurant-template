"use client";

import Underline from "@/components/ui/Underline";
import { markRange, parseMarked, remark, splitHighlights } from "@/lib/highlight";
import { useRef, useState } from "react";
import { FiEdit3, FiX } from "react-icons/fi";
import { inputClasses } from "./field-styles";

interface HighlightInputProps {
    id: string;
    /** The text with its **marked** part, as saved. */
    value: string;
    onChange: (value: string) => void;
    /** Of the plain text (markers don't count). */
    maxLength: number;
    placeholder?: string;
    describedBy?: string;
    invalid?: boolean;
}

// A section title whose highlighted words get the brand underline. The owner
// never sees the ** markers: she types plain text, selects words and taps
// «ميّز». A small preview under the field shows the result.
const HighlightInput = ({ id, value, onChange, maxLength, placeholder, describedBy, invalid }: HighlightInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState("");
    const marked = parseMarked(value);
    const hasHighlight = marked.end > marked.start;

    const highlightSelection = () => {
        const input = inputRef.current;
        const start = input?.selectionStart ?? 0;
        const end = input?.selectionEnd ?? 0;
        if (end <= start || !marked.plain.slice(start, end).trim()) {
            setMessage("حدّد الكلمة اللي بدك تميّزها بالعنوان، وبعدين اكبس «ميّز».");
            input?.focus();
            return;
        }
        setMessage("");
        // One highlight per title: a new one replaces the old
        onChange(markRange({ plain: marked.plain, start, end }));
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex gap-8">
                <input
                    ref={inputRef}
                    id={id}
                    value={marked.plain}
                    onChange={(event) => onChange(remark(marked, event.target.value))}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    aria-invalid={invalid}
                    aria-describedby={[describedBy, `${id}-preview`].filter(Boolean).join(" ")}
                    className={`${inputClasses} min-w-0`}
                />
                <button
                    type="button"
                    // Keeps the selection on desktop (the field doesn't lose focus)
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={highlightSelection}
                    className="inline-flex h-44 shrink-0 items-center gap-6 rounded-full border border-border bg-background px-14 text-sm font-bold transition-colors hover:border-primary hover:text-primary"
                >
                    <FiEdit3 aria-hidden="true" />
                    ميّز
                </button>
            </div>

            {message && (
                <p role="status" className="text-xs font-bold text-primary">
                    {message}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-8 rounded-xl border border-dashed border-border px-12 py-10">
                <p id={`${id}-preview`} className="font-display text-xl font-extrabold leading-snug">
                    <span className="sr-only">شكل العنوان: </span>
                    {marked.plain.trim()
                        ? splitHighlights(value).map((part, index) =>
                              part.highlighted ? (
                                  <span key={index} className="inline-block">
                                      {part.text}
                                      <Underline />
                                  </span>
                              ) : (
                                  part.text
                              )
                          )
                        : "…"}
                </p>
                {hasHighlight && (
                    <button
                        type="button"
                        onClick={() => onChange(marked.plain)}
                        className="inline-flex h-32 items-center gap-4 rounded-full px-10 text-xs font-bold text-muted transition-colors hover:text-danger"
                    >
                        <FiX aria-hidden="true" />
                        شيل التمييز
                    </button>
                )}
            </div>
        </div>
    );
};

export default HighlightInput;
