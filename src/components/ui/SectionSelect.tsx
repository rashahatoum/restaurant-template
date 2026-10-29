"use client";

import type { SectionNavItem } from "@/types/navigation";
import { FiChevronDown } from "react-icons/fi";

interface SectionSelectProps {
    items: readonly SectionNavItem[];
    /** Section currently in view; empty shows the placeholder. */
    activeId?: string;
    onSelect: (id: string) => void;
    /** Label of the empty first option, also the accessible name. */
    placeholder: string;
}

// Native <select> jumping to a section: opens in place (the OS picker on
// phones), keyboard and screen readers work out of the box.
const SectionSelect = ({ items, activeId, onSelect, placeholder }: SectionSelectProps) => {
    const handleChange = (id: string) => {
        if (!id) return;

        onSelect(id);
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        // scrollIntoView respects the section's scroll-margin (sticky bar height).
        document.getElementById(id)?.scrollIntoView({
            behavior: reduceMotion ? "auto" : "smooth",
        });
    };

    return (
        <div className="relative">
            <select
                value={activeId ?? ""}
                onChange={(event) => handleChange(event.target.value)}
                aria-label={placeholder}
                className="h-44 w-full cursor-pointer appearance-none rounded-full border border-border bg-surface ps-16 pe-40 text-base font-bold text-foreground transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
                <option value="">{placeholder}</option>
                {items.map((item) => (
                    <option key={item.id} value={item.id}>
                        {`${item.icon} ${item.label} (${item.count})`}
                    </option>
                ))}
            </select>

            <FiChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute inset-e-16 top-1/2 -translate-y-1/2 text-primary"
            />
        </div>
    );
};

export default SectionSelect;
