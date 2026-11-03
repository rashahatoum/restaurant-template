import type { AppError } from "@/lib/api/errors";
import { FiRefreshCw } from "react-icons/fi";
import FormAlert from "./FormAlert";
import { errorPresentation } from "./error-presentation";

interface AppErrorAlertProps {
    error: AppError;
    /** Shown as "جرّب مرة تانية" when the error is temporary. */
    onRetry?: () => void;
}

// What a screen shows for a failed load or save: the right tone, icon and
// message for the error kind, plus a retry button when retrying can help.
const AppErrorAlert = ({ error, onRetry }: AppErrorAlertProps) => {
    const { tone, icon, canRetry } = errorPresentation[error.kind];

    return (
        <FormAlert
            tone={tone}
            icon={icon}
            action={
                canRetry && onRetry ? (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex items-center gap-6 rounded-full border border-border bg-background px-14 py-6 font-bold transition-colors hover:border-primary hover:text-primary"
                    >
                        <FiRefreshCw aria-hidden="true" />
                        جرّب مرة تانية
                    </button>
                ) : undefined
            }
        >
            {error.message}
        </FormAlert>
    );
};

export default AppErrorAlert;
