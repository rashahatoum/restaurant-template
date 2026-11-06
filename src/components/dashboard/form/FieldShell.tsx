import FieldError from "@/components/dashboard/feedback/FieldError";
import type { ReactNode } from "react";

interface FieldShellProps {
    /** The control's id (the label points at it). */
    htmlFor: string;
    label: string;
    /** Help under the field, e.g. the photo shape. Its id is `${htmlFor}-hint`. */
    hint?: string;
    /** Its id is `${htmlFor}-error`. */
    error?: string;
    /** E.g. "12/40", shown at the label's end. */
    counter?: string;
    children: ReactNode;
}

/** The ids a control should list in aria-describedby (match FieldShell's hint and error ids). */
export const describedBy = (id: string, { hasHint = false, error }: { hasHint?: boolean; error?: string }) =>
    [hasHint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;

// Label, control, hint and error in the same order everywhere. Presentational:
// the control (and its aria-invalid / aria-describedby) comes from the caller.
const FieldShell = ({ htmlFor, label, hint, error, counter, children }: FieldShellProps) => {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-baseline justify-between gap-8">
                <label htmlFor={htmlFor} className="text-sm font-bold">
                    {label}
                </label>
                {counter && (
                    <span aria-hidden="true" className="text-xs text-muted tabular-nums">
                        {counter}
                    </span>
                )}
            </div>
            {children}
            {hint && (
                <p id={`${htmlFor}-hint`} className="text-xs leading-relaxed text-muted">
                    {hint}
                </p>
            )}
            <FieldError id={`${htmlFor}-error`} message={error} />
        </div>
    );
};

export default FieldShell;
