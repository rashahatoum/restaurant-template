import { FiX } from "react-icons/fi";
import { toneStyles, type FeedbackTone } from "./FormAlert";

interface ToastProps {
    tone: FeedbackTone;
    message: string;
    /** One action, e.g. "تراجع" after a quick edit or "جرّب مرة تانية" after a failure. */
    action?: { label: string; onClick: () => void };
    onClose?: () => void;
}

// A short message after a quick action (price changed, saved, failed).
// Presentational: ToastViewport places it and owns the live region, which
// must exist before the text appears for screen readers to announce it.
const Toast = ({ tone, message, action, onClose }: ToastProps) => {
    const style = toneStyles[tone];
    const Icon = style.icon;

    return (
        <div
            className="flex w-full max-w-420 items-center gap-10 rounded-2xl border border-border bg-surface p-10 ps-14 text-sm shadow-lg shadow-black/40"
        >
            <Icon aria-hidden="true" className={`shrink-0 text-lg ${style.text}`} />
            <p className="min-w-0 flex-1 font-bold">{message}</p>

            {action && (
                <button
                    type="button"
                    onClick={action.onClick}
                    className="shrink-0 rounded-full px-10 py-6 font-extrabold text-primary transition-colors hover:bg-primary/10"
                >
                    {action.label}
                </button>
            )}

            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="سكّر"
                    className="flex size-32 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-background hover:text-foreground"
                >
                    <FiX aria-hidden="true" />
                </button>
            )}
        </div>
    );
};

export default Toast;
