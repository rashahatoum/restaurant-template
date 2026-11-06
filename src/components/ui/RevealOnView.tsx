"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface RevealOnViewProps {
    /** Server-rendered content using the reveal-word utility (see globals.css). */
    children: ReactNode;
    /** Share of the content that must be visible to start, 0–1. */
    threshold?: number;
}

// Marks its content data-revealed="true" once it scrolls into view (once).
// The animation itself is CSS; this is the only part that needs the browser.
const RevealOnView = ({ children, threshold = 0.6 }: RevealOnViewProps) => {
    const ref = useRef<HTMLSpanElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);

    // Browser-only API: start the reveal when most of the content is visible
    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsRevealed(true);
                    observer.disconnect();
                }
            },
            { threshold }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold]);

    return (
        <span ref={ref} data-revealed={isRevealed}>
            {children}
        </span>
    );
};

export default RevealOnView;
