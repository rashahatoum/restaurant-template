"use client";

import { LOGIN_PATH } from "@/lib/auth/paths";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { FiLock } from "react-icons/fi";

interface SessionExpiredDialogProps {
    open: boolean;
    /** The page to come back to after signing in again. */
    returnTo: string;
    /** Lab only: lets the demo close it. Real use has no way around signing in. */
    onClose?: () => void;
}

// Shown when the API says the login ended (401). Native modal <dialog>:
// focus is trapped and the page behind can't be used. Signing in again
// returns to the same page. (Keeping unsaved form values across the login is
// for the API phase, if the owner hits it in practice.)
const SessionExpiredDialog = ({ open, returnTo, onClose }: SessionExpiredDialogProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    // showModal() is the only way to open a modal <dialog>: an imperative DOM call
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby="session-expired-title"
            onCancel={(event) => {
                // Escape closes it only where closing is allowed (lab)
                if (!onClose) event.preventDefault();
                else onClose();
            }}
            className="m-auto w-[min(360px,calc(100vw-32px))] rounded-3xl border border-border bg-surface p-24 text-center text-foreground backdrop:bg-black/70"
        >
            <span className="mx-auto mb-12 flex size-56 items-center justify-center rounded-full bg-warning/10 text-2xl text-warning">
                <FiLock aria-hidden="true" />
            </span>
            <h2 id="session-expired-title" className="mb-6 font-display text-xl font-bold">
                انتهت الجلسة
            </h2>
            <p className="mb-20 text-sm leading-relaxed text-muted">
                لحماية حسابك، سجّل دخول من جديد. رح نرجّعك لنفس الصفحة.
            </p>
            <Link
                href={`${LOGIN_PATH}?next=${encodeURIComponent(returnTo)}`}
                className="flex h-46 items-center justify-center rounded-full bg-primary font-extrabold text-background transition-opacity hover:opacity-90"
            >
                سجّل دخول
            </Link>
            {onClose && (
                <button type="button" onClick={onClose} className="mt-10 text-sm font-bold text-muted hover:text-foreground">
                    سكّر (معاينة بس)
                </button>
            )}
        </dialog>
    );
};

export default SessionExpiredDialog;
