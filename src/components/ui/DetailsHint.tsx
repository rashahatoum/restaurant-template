import type { ReactNode } from "react";
import { FiArrowLeft } from "react-icons/fi";

interface DetailsHintProps {
    children?: ReactNode;
}

// A small "see more" cue: on a card ("شوف المكونات") or next to the slider
// arrows ("عرض الكل"). Just text: the parent supplies the link (with `group`
// for the hover underline).
const DetailsHint = ({ children = "شوف المكونات" }: DetailsHintProps) => {
    return (
        <span className="inline-flex items-center gap-4 text-sm font-bold text-primary underline-offset-4 group-hover:underline">
            {children}
            <FiArrowLeft aria-hidden="true" className="ltr:rotate-180" />
        </span>
    );
};

export default DetailsHint;
