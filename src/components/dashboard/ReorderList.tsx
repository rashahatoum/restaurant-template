"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";

interface ReorderListProps {
    /** `<li data-flip-id="…">` items; the id follows an item when it moves. */
    children: ReactNode;
    className?: string;
}

const DURATION_MS = 320;
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

// An ordered list whose items glide to their new place when the order
// changes (categories, offers, banner slides…). FLIP: after each render,
// compare every item's position with the last one, start it where it was and
// animate to where it is (Web Animations API, transform only, no library).
// Positions are read relative to the list (offsetTop), so scrolling doesn't
// count; with "reduce motion" items just jump.
const ReorderList = ({ children, className }: ReorderListProps) => {
    const listRef = useRef<HTMLOListElement>(null);
    const lastTops = useRef(new Map<string, number>());

    // No deps on purpose: any render may have moved items; measuring a short list is cheap
    useLayoutEffect(() => {
        const list = listRef.current;
        if (!list) return;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const tops = new Map<string, number>();

        for (const item of Array.from(list.children)) {
            if (!(item instanceof HTMLElement) || !item.dataset.flipId) continue;
            const id = item.dataset.flipId;
            const top = item.offsetTop;
            tops.set(id, top);

            const before = lastTops.current.get(id);
            if (reduceMotion || before === undefined || before === top) continue;

            const movedUp = before > top;
            item.animate(
                [
                    // The item moving up passes over the other one, slightly lifted
                    { transform: `translateY(${before - top}px)`, zIndex: movedUp ? 1 : 0 },
                    { transform: movedUp ? "translateY(0) scale(1.015)" : "translateY(0)", zIndex: movedUp ? 1 : 0, offset: 0.7 },
                    { transform: "none", zIndex: movedUp ? 1 : 0 },
                ],
                { duration: DURATION_MS, easing: EASING }
            );
        }
        lastTops.current = tops;
    });

    return (
        <ol ref={listRef} className={`relative ${className ?? ""}`}>
            {children}
        </ol>
    );
};

export default ReorderList;
