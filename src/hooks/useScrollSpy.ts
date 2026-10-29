import { useEffect, useState } from "react";

/**
 * Which of the given sections is crossing a thin band near the top of the
 * viewport (undefined until one does). Returns the setter too, so a pick
 * can update it immediately. Pass enabled=false while the sections aren't
 * rendered (e.g. during search).
 */
export function useScrollSpy(ids: readonly string[], enabled = true) {
    const [activeId, setActiveId] = useState<string>();

    // A string key, so a new array with the same ids doesn't re-subscribe.
    const idsKey = ids.join("|");

    // Observing elements outside React is a real side effect.
    useEffect(() => {
        if (!enabled) return;

        const sections = idsKey
            .split("|")
            .map((id) => document.getElementById(id))
            .filter((section) => section !== null);

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                }
            },
            { rootMargin: "-30% 0px -65% 0px" }
        );

        sections.forEach((section) => observer.observe(section));
        return () => observer.disconnect();
    }, [idsKey, enabled]);

    return [activeId, setActiveId] as const;
}
