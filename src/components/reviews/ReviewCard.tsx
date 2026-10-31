import HighlightedText from "@/components/ui/HighlightedText";
import { FaWhatsapp } from "react-icons/fa";
import { IoCheckmarkDone } from "react-icons/io5";

interface ReviewCardProps {
    customerName: string;
    /** Restaurant's message. */
    question: string;
    /** Customer's reply; supports **highlights**. */
    answer: string;
    time?: string;
    /** Tiling chat wallpaper (brand asset, from config). Falls back to plain dots. */
    wallpaper?: string;
}

// A review as a tiny WhatsApp chat, in theme colors. As in Arabic WhatsApp,
// the sender (restaurant) sits on the end side (left in RTL), the customer on
// the start side. Fills its slide height so cards in a slider match.
const ReviewCard = ({ customerName, question, answer, time, wallpaper }: ReviewCardProps) => {
    return (
        <article className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-[0_24px_60px_-30px_var(--color-primary)]">
            {/* Chat header */}
            <header className="flex items-center gap-12 bg-surface px-16 py-12">
                <span
                    aria-hidden="true"
                    className="flex size-40 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-background"
                >
                    {customerName.charAt(0)}
                </span>

                <h3 className="flex-1 font-bold">{customerName}</h3>

                <FaWhatsapp aria-label="واتساب" className="text-xl text-muted" />
            </header>

            {/* Chat body: the brand's chat wallpaper (or subtle dots). Messages sit
                at the bottom like a real chat, so shorter reviews leave the empty space on top. */}
            <div
                className={`flex flex-1 flex-col justify-end gap-12 p-16 ${
                    wallpaper
                        ? "bg-size-[400px] bg-repeat"
                        : "bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] bg-size-[16px_16px]"
                }`}
                style={wallpaper ? { backgroundImage: `url(${wallpaper})` } : undefined}
            >
                {/* Restaurant (sender): the same 15% orange tint, but solid, so the wallpaper doesn't show through */}
                <p className="max-w-[85%] self-end rounded-2xl rounded-se-none bg-[color-mix(in_srgb,var(--color-primary)_15%,var(--color-background))] px-12 py-8 text-sm leading-relaxed">
                    {question}
                    <IoCheckmarkDone
                        aria-hidden="true"
                        className="ms-6 inline text-base text-primary"
                    />
                </p>

                {/* Customer (reply) */}
                <blockquote className="max-w-[90%] self-start rounded-2xl rounded-ss-none bg-surface px-12 py-8 leading-relaxed">
                    {/* Safety net: the dashboard caps reply length; this keeps one
                        overlong reply from stretching every card. */}
                    <p className="line-clamp-6">
                        <HighlightedText text={answer} />
                    </p>

                    {time && (
                        <span className="mt-4 block text-end text-xs text-muted">
                            {time}
                        </span>
                    )}
                </blockquote>
            </div>
        </article>
    );
};

export default ReviewCard;
