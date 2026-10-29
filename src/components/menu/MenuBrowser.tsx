"use client";

import SearchField from "@/components/ui/SearchField";
import SectionSelect from "@/components/ui/SectionSelect";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { matchesQuery } from "@/lib/search";
import type { SectionNavItem } from "@/types/navigation";
import { Fragment, useRef, useState, type ReactNode } from "react";

export interface MenuBrowserEntry {
    key: string;
    /** Pre-normalized on the server (lib/search normalizeArabic). */
    searchText: string;
    /** A server-rendered row. */
    node: ReactNode;
}

export interface MenuBrowserSection {
    id: string;
    title: string;
    icon: string;
    entries: readonly MenuBrowserEntry[];
}

interface MenuBrowserProps {
    sections: readonly MenuBrowserSection[];
}

function formatResults(count: number) {
    if (count === 1) return "لقينا نتيجة وحدة";
    if (count === 2) return "لقينا نتيجتين";
    return `لقينا ${count} نتائج`;
}

const gridClasses = "grid gap-10 md:grid-cols-2 md:gap-16";

// Sticky bar (always-visible search + section dropdown) and the menu body.
// One client component because the search box and the results share state.
// The rows are server-rendered and arrive as `node`s; only filtering runs here.
const MenuBrowser = ({ sections }: MenuBrowserProps) => {
    const [query, setQuery] = useState("");
    const isSearching = query.trim() !== "";

    const navItems: SectionNavItem[] = sections.map((section) => ({
        id: section.id,
        label: section.title,
        icon: section.icon,
        count: section.entries.length,
    }));

    const [activeId, setActiveId] = useScrollSpy(
        navItems.map((item) => item.id),
        !isSearching
    );

    // Marks where the bar sits in the page.
    const barStartRef = useRef<HTMLDivElement>(null);

    // Scrolls so the bar is pinned to the top (only if it's below that point),
    // so search results start right under it.
    const pinBarToTop = () => {
        const start = barStartRef.current;
        if (!start) return;

        const top = start.getBoundingClientRect().top;
        if (top > 0) window.scrollTo({ top: top + window.scrollY });
    };

    const handleQueryChange = (value: string) => {
        if (!isSearching && value.trim() !== "") pinBarToTop();
        setQuery(value);
    };

    const results = isSearching
        ? sections
              .flatMap((section) => section.entries)
              .filter((entry) => matchesQuery(entry.searchText, query))
        : [];

    return (
        <>
            <div ref={barStartRef} />

            {/* =========================
                STICKY BAR
            ========================== */}

            {/* Phones: search on its own row, the section picker under it. md+: one row. */}
            <div className="sticky top-0 z-40 border-b border-border/60 bg-background/95 px-page-gutter backdrop-blur-sm">
                <div className="flex flex-col gap-8 py-10 md:flex-row md:items-center md:gap-12 md:py-14">
                    <SearchField
                        value={query}
                        onChange={handleQueryChange}
                        onClear={() => setQuery("")}
                        label="بحث بالقائمة"
                        placeholder="دوّر على وجبة أو مكوّن…"
                    />

                    {/* Hidden while searching: results replace the sections */}
                    {!isSearching && (
                        <nav aria-label="التصنيفات" className="md:w-280 md:shrink-0">
                            <SectionSelect
                                items={navItems}
                                activeId={activeId}
                                onSelect={setActiveId}
                                placeholder="اختر التصنيف"
                            />
                        </nav>
                    )}
                </div>
            </div>

            {/* =========================
                BODY: search results or all sections
            ========================== */}

            <div className="px-page-gutter">
                <p role="status" className={isSearching ? "pt-20 text-sm font-bold text-muted" : "sr-only"}>
                    {isSearching &&
                        results.length > 0 &&
                        `${formatResults(results.length)} لـ «${query.trim()}»`}
                </p>

                {isSearching ? (
                    results.length > 0 ? (
                        <div className={`${gridClasses} pt-12`}>
                            {results.map((entry) => (
                                <Fragment key={entry.key}>{entry.node}</Fragment>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-12 py-64 text-center">
                            <p className="font-display text-xl font-bold">
                                ما لقينا شي لـ «{query.trim()}»
                            </p>
                            <p className="text-muted">جرّب كلمة تانية، متل «شاورما» أو «سمون».</p>
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                className="mt-4 rounded-full border border-border px-20 py-8 font-bold transition-colors hover:border-primary hover:text-primary"
                            >
                                رجوع للقائمة
                            </button>
                        </div>
                    )
                ) : (
                    sections.map((section) => (
                        <section
                            key={section.id}
                            id={section.id}
                            aria-labelledby={`${section.id}-title`}
                            // Clears the sticky bar (two rows on phones) when jumped to
                            className="scroll-mt-120 pt-24 md:scroll-mt-80 md:pt-40"
                        >
                            <h2
                                id={`${section.id}-title`}
                                className="mb-12 flex items-center gap-8 font-display text-2xl font-bold md:mb-16 md:text-3xl"
                            >
                                <span aria-hidden="true">{section.icon}</span>
                                {section.title}
                            </h2>

                            <div className={gridClasses}>
                                {section.entries.map((entry) => (
                                    <Fragment key={entry.key}>{entry.node}</Fragment>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>
        </>
    );
};

export default MenuBrowser;
