import RevealOnView from "@/components/ui/RevealOnView";
import { splitHighlights } from "@/lib/highlight";
import { Fragment, type CSSProperties } from "react";

interface RevealTextProps {
    /** Copy with optional **highlighted** parts (see splitHighlights). */
    text: string;
    /** Delay between two words, in ms. */
    stagger?: number;
}

// Reveals the text word by word once it scrolls into view (plays once).
// Server Component: the words are split and rendered here; only RevealOnView
// (the scroll observer) runs in the browser. Without JS (scripting: none) or
// with reduced motion the text is shown as is; see the reveal-word utility in
// globals.css. The parent sets tag and size.
const RevealText = ({ text, stagger = 90 }: RevealTextProps) => {
    const words = splitHighlights(text).flatMap((part) =>
        part.text
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => ({ word, highlighted: part.highlighted }))
    );

    return (
        <RevealOnView>
            {words.map(({ word, highlighted }, index) => (
                <Fragment key={index}>
                    <span
                        className={`reveal-word inline-block ${highlighted ? "font-bold text-primary" : ""}`}
                        style={{ "--reveal-delay": `${index * stagger}ms` } as CSSProperties}
                    >
                        {word}
                    </span>{" "}
                </Fragment>
            ))}
        </RevealOnView>
    );
};

export default RevealText;
