import { toWhatsAppShareHref } from "@/lib/contact";
import { FaWhatsapp } from "react-icons/fa";

interface ShareOnWhatsAppProps {
    /** The message, link included. */
    text: string;
    label?: string;
}

// Opens WhatsApp with a ready message; the customer picks who to send it to.
// Phones: a circle with the WhatsApp icon (same size as the add button);
// from md: a pill with the label. Outlined in WhatsApp green so it reads as
// "WhatsApp" without competing with the solid primary action next to it.
// A plain link: no JavaScript.
const ShareOnWhatsApp = ({ text, label = "شارك عبر واتساب" }: ShareOnWhatsAppProps) => {
    return (
        <a
            href={toWhatsAppShareHref(text)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-36 shrink-0 items-center justify-center gap-6 rounded-full border-2 border-whatsapp text-whatsapp transition-colors hover:bg-whatsapp hover:text-background md:size-auto md:h-40 md:px-14 md:text-sm md:font-bold"
        >
            <FaWhatsapp aria-hidden="true" className="text-lg" />
            {/* The name stays readable for screen readers on phones */}
            <span className="sr-only md:not-sr-only">{label}</span>
        </a>
    );
};

export default ShareOnWhatsApp;
