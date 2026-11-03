"use client";

import { useEffect, useRef } from "react";
import { FiAlertTriangle } from "react-icons/fi";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    /** E.g. "إي، رجّعها". */
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}

// Asks once before something hard to undo (reset, delete). Native modal
// <dialog>: Escape and the cancel button both cancel; focus starts on cancel,
// the safe choice.
const ConfirmDialog = ({ open, title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) => {
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
            aria-labelledby="confirm-title"
            aria-describedby="confirm-message"
            onCancel={(event) => {
                event.preventDefault();
                onCancel();
            }}
            className="m-auto w-[min(380px,calc(100vw-32px))] rounded-3xl border border-border bg-surface p-24 text-center text-foreground backdrop:bg-black/70"
        >
            <span className="mx-auto mb-12 flex size-56 items-center justify-center rounded-full bg-warning/10 text-2xl text-warning">
                <FiAlertTriangle aria-hidden="true" />
            </span>
            <h2 id="confirm-title" className="mb-6 font-display text-xl font-bold">
                {title}
            </h2>
            <p id="confirm-message" className="mb-20 text-sm leading-relaxed text-muted">
                {message}
            </p>
            <div className="flex flex-col gap-8">
                <button
                    type="button"
                    onClick={onConfirm}
                    className="flex h-46 items-center justify-center rounded-full bg-danger font-extrabold text-background transition-opacity hover:opacity-90"
                >
                    {confirmLabel}
                </button>
                <button
                    type="button"
                    autoFocus
                    onClick={onCancel}
                    className="flex h-46 items-center justify-center rounded-full border border-border font-bold transition-colors hover:border-primary hover:text-primary"
                >
                    لا، خليها
                </button>
            </div>
        </dialog>
    );
};

export default ConfirmDialog;
