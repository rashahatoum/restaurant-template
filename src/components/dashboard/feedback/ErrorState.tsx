import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FiAlertCircle } from "react-icons/fi";

interface ErrorStateProps {
    title: string;
    message: string;
    icon?: IconType;
    /** Buttons, e.g. "جرّب مرة تانية" and "ارجع للرئيسية". */
    actions?: ReactNode;
}

// A whole screen that couldn't load: what happened and what to do next.
const ErrorState = ({ title, message, icon: Icon = FiAlertCircle, actions }: ErrorStateProps) => {
    return (
        <div role="alert" className="flex flex-col items-center gap-12 px-16 py-64 text-center">
            <span className="flex size-64 items-center justify-center rounded-full bg-danger/10 text-3xl text-danger">
                <Icon aria-hidden="true" />
            </span>
            <h2 className="font-display text-xl font-bold">{title}</h2>
            <p className="max-w-360 text-muted">{message}</p>
            {actions && <div className="mt-8 flex flex-wrap justify-center gap-10">{actions}</div>}
        </div>
    );
};

export default ErrorState;
