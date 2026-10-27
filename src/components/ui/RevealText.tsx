"use client";

import { splitHighlights } from "@/lib/highlight";
import {
    Fragment,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
} from "react";

interface RevealTextProps {
    /** Copy with optional **highlighted** parts (see splitHighlights). */
    text: string;
    /** Delay between two words, in ms. */
    stagger?: number;
}

// Reveals the text word by word once it scrolls into view (plays once).
// Without JS (scripting: none) or with reduced motion the text is shown as is;
// see the reveal-word utility in globals.css. The parent sets tag and size.
const RevealText = ({ text, stagger = 90 }: RevealTextProps) => {
    const ref = useRef<HTMLSpanElement>(null);
    const [isRevealed, setIsRevealed] = useState(false);

    // Browser-only API: start the reveal when most of the text is visible.
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
            { threshold: 0.6 }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, []);

    const words = splitHighlights(text).flatMap((part) =>
        part.text
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => ({ word, highlighted: part.highlighted }))
    );

    return (
        <span ref={ref} data-revealed={isRevealed}>
            {words.map(({ word, highlighted }, index) => (
                <Fragment key={index}>
                    <span
                        className={`reveal-word inline-block ${
                            highlighted ? "font-bold text-primary" : ""
                        }`}
                        style={{ "--reveal-delay": `${index * stagger}ms` } as CSSProperties}
                    >
                        {word}
                    </span>{" "}
                </Fragment>
            ))}
        </span>
    );
};

export default RevealText;
