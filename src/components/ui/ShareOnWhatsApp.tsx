import { toWhatsAppShareHref } from "@/lib/contact";
import { FaWhatsapp } from "react-icons/fa";

interface ShareOnWhatsAppProps {
    /** The message, link included. */
    text: string;
    label?: string;
}

// Button-sized link that opens WhatsApp with a ready message; the customer
// picks who to send it to. Outlined in WhatsApp green so it reads as
// "WhatsApp" without competing with the solid primary action next to it.
// A plain link: no JavaScript. The parent sets the width.
const ShareOnWhatsApp = ({ text, label = "شارك عبر واتساب" }: ShareOnWhatsAppProps) => {
    return (
        <a
            href={toWhatsAppShareHref(text)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-44 items-center justify-center gap-8 rounded-full border-2 border-whatsapp px-18 font-bold text-whatsapp transition-colors hover:bg-whatsapp hover:text-background md:h-46"
        >
            <FaWhatsapp aria-hidden="true" className="text-xl" />
            {label}
        </a>
    );
};

export default ShareOnWhatsApp;
