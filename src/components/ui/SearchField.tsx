"use client";

import { FiSearch, FiX } from "react-icons/fi";

interface SearchFieldProps {
    value: string;
    onChange: (value: string) => void;
    /** Clears the query (✕ button or Escape). */
    onClear: () => void;
    /** Accessible name of the input. */
    label: string;
    placeholder?: string;
}

// Always-visible, controlled search input. The ✕ appears once there is text.
// flex-1 only from md (row layout): in a column, flex-basis 0 would override h-44.
const SearchField = ({ value, onChange, onClear, label, placeholder }: SearchFieldProps) => {
    return (
        <label className="flex h-44 min-w-0 items-center md:flex-1 gap-8 rounded-full border border-border bg-surface px-14 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30">
            <FiSearch aria-hidden="true" className="shrink-0 text-primary" />
            <span className="sr-only">{label}</span>

            {/* text-base (16px) keeps iOS from zooming in on focus */}
            <input
                type="search"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === "Escape") onClear();
                }}
                placeholder={placeholder}
                enterKeyHint="search"
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
            />

            {value && (
                <button
                    type="button"
                    onClick={onClear}
                    aria-label="مسح البحث"
                    className="-me-6 flex size-28 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-primary"
                >
                    <FiX aria-hidden="true" />
                </button>
            )}
        </label>
    );
};

export default SearchField;
