import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";

export type FeedbackTone = "error" | "warning" | "success";

interface FormAlertProps {
    tone: FeedbackTone;
    children: ReactNode;
    /** Bold first line, e.g. "ما انحفظ". */
    title?: string;
    /** Overrides the tone's icon (e.g. no connection). */
    icon?: IconType;
    /** A button or link, e.g. "جرّب مرة تانية". */
    action?: ReactNode;
}

export const toneStyles: Record<FeedbackTone, { box: string; text: string; icon: IconType }> = {
    error: { box: "border-danger/40 bg-danger/10", text: "text-danger", icon: FiAlertCircle },
    warning: { box: "border-warning/40 bg-warning/10", text: "text-warning", icon: FiAlertTriangle },
    success: { box: "border-success/40 bg-success/10", text: "text-success", icon: FiCheckCircle },
};

// A message box at the top of a form or a screen. Icon + text, never color
// alone. Errors are announced at once (role="alert"), others politely.
const FormAlert = ({ tone, children, title, icon, action }: FormAlertProps) => {
    const style = toneStyles[tone];
    const Icon = icon ?? style.icon;

    return (
        <div
            role={tone === "error" ? "alert" : "status"}
            className={`flex items-start gap-10 rounded-2xl border p-12 text-sm leading-relaxed ${style.box}`}
        >
            <Icon aria-hidden="true" className={`mt-2 shrink-0 text-lg ${style.text}`} />
            <div className="flex min-w-0 flex-1 flex-col gap-8">
                <div>
                    {title && <p className={`font-extrabold ${style.text}`}>{title}</p>}
                    <div className="text-foreground">{children}</div>
                </div>
                {action && <div className="flex flex-wrap gap-8">{action}</div>}
            </div>
        </div>
    );
};

export default FormAlert;
