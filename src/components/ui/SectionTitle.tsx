import { splitHighlights } from "@/lib/highlight";
import type { IconType } from "react-icons";

import Underline from "./Underline";

interface SectionTitleProps {
    /** Used as the h2 id; point the section's aria-labelledby at it. */
    id: string;
    eyebrow: string;
    /** **Marked** part gets the brand underline: "الأكثر **مبيعاً**". */
    title: string;
    eyebrowIcon?: IconType;
    align?: "center" | "start";
}

// Shared heading for home sections: orange eyebrow + display h2.
const SectionTitle = ({
    id,
    eyebrow,
    title,
    eyebrowIcon: EyebrowIcon,
    align = "center",
}: SectionTitleProps) => {
    return (
        <div
            className={`flex flex-col gap-12 ${
                align === "center"
                    ? "items-center text-center"
                    : "items-start text-start"
            }`}
        >
            <p className="flex items-center gap-8 text-sm font-bold text-primary md:text-base">
                {EyebrowIcon && (
                    <EyebrowIcon aria-hidden="true" className="text-lg" />
                )}
                {eyebrow}
            </p>

            <h2
                id={id}
                className="font-display text-4xl font-extrabold leading-snug lg:text-5xl"
            >
                {splitHighlights(title).map((part, index) =>
                    part.highlighted ? (
                        <span key={index} className="inline-block">
                            {part.text}
                            <Underline />
                        </span>
                    ) : (
                        part.text
                    )
                )}
            </h2>
        </div>
    );
};

export default SectionTitle;
