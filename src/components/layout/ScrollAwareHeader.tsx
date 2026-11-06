"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Past this scroll offset the header turns solid and compact. */
const SCROLLED_AFTER = 16;

interface ScrollAwareHeaderProps {
    className: string;
    /** Server-rendered header content. */
    children: ReactNode;
}

// The only browser-dependent part of the header: whether the page has
// scrolled. It sets data-scrolled; the look lives in the server's classes
// (data-[scrolled=true]: and group-data-[scrolled=true]/header:).
const ScrollAwareHeader = ({ className, children }: ScrollAwareHeaderProps) => {
    const [scrolled, setScrolled] = useState(false);

    // Scroll position is browser state: read it on scroll (passive, cheap)
    useEffect(() => {
        const update = () => setScrolled(window.scrollY > SCROLLED_AFTER);
        update();
        window.addEventListener("scroll", update, { passive: true });
        return () => window.removeEventListener("scroll", update);
    }, []);

    return (
        <header data-scrolled={scrolled} className={`group/header ${className}`}>
            {children}
        </header>
    );
};

export default ScrollAwareHeader;
