import { splitHighlights } from "@/lib/highlight";

interface HighlightedTextProps {
    /** Copy with **highlighted** parts (see splitHighlights). */
    text: string;
}

// Renders **marked** words in the primary color. The parent element sets the tag and size.
const HighlightedText = ({ text }: HighlightedTextProps) => {
    return splitHighlights(text).map((part, index) =>
        part.highlighted ? (
            <strong key={index} className="font-bold text-primary">
                {part.text}
            </strong>
        ) : (
            part.text
        )
    );
};

export default HighlightedText;
