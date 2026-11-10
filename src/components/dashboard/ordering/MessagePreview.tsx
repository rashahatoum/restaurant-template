interface MessagePreviewProps {
    /** From lib/order buildOrderMessage, as the restaurant receives it. */
    message: string;
    /** Filled; what the customer reads on the site after WhatsApp opens. */
    thankYou: string;
}

// The order message as a WhatsApp bubble, then the thank-you note. Hook-free:
// the form passes the texts in, so it updates while typing.
const MessagePreview = ({ message, thankYou }: MessagePreviewProps) => {
    return (
        <div className="flex flex-col gap-14">
            <figure className="flex flex-col gap-8">
                <figcaption className="text-xs font-bold text-muted">هيك بتوصل الرسالة عالواتساب (طلب تجريبي)</figcaption>
                <div className="rounded-2xl bg-[#0b141a] p-12">
                    {/* WhatsApp's own sent-bubble colours, the same in light and dark */}
                    <p className="ms-auto max-w-[92%] whitespace-pre-wrap break-words rounded-xl rounded-se-sm bg-[#005c4b] px-12 py-10 text-sm leading-relaxed text-[#e9edef]">
                        {message}
                    </p>
                </div>
            </figure>
            <figure className="flex flex-col gap-8">
                <figcaption className="text-xs font-bold text-muted">وهيك بيقرأ الزبون رسالة الشكر بالموقع</figcaption>
                <p className="rounded-2xl border border-border bg-background p-12 text-sm leading-relaxed text-muted">{thankYou}</p>
            </figure>
        </div>
    );
};

export default MessagePreview;
