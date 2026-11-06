import type { AppErrorKind } from "@/lib/api/errors";
import type { IconType } from "react-icons";
import { FiAlertCircle, FiClock, FiLock, FiSearch, FiWifiOff } from "react-icons/fi";
import type { FeedbackTone } from "./FormAlert";

interface ErrorPresentation {
    tone: FeedbackTone;
    icon: IconType;
    /** Trying again can help (temporary failures). */
    canRetry: boolean;
}

// How each error kind looks. Temporary problems (connection, too many tries)
// are warnings; the rest are errors.
export const errorPresentation: Record<AppErrorKind, ErrorPresentation> = {
    validation: { tone: "error", icon: FiAlertCircle, canRetry: false },
    unauthenticated: { tone: "warning", icon: FiLock, canRetry: false },
    forbidden: { tone: "error", icon: FiLock, canRetry: false },
    not_found: { tone: "error", icon: FiSearch, canRetry: false },
    conflict: { tone: "warning", icon: FiAlertCircle, canRetry: false },
    too_large: { tone: "error", icon: FiAlertCircle, canRetry: false },
    rate_limited: { tone: "warning", icon: FiClock, canRetry: false },
    server: { tone: "error", icon: FiAlertCircle, canRetry: true },
    offline: { tone: "warning", icon: FiWifiOff, canRetry: true },
    timeout: { tone: "warning", icon: FiClock, canRetry: true },
};
