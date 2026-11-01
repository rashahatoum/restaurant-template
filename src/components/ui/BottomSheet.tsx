"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { FiX } from "react-icons/fi";

interface BottomSheetProps {
    open: boolean;
    /** Escape, the ✕, or a tap on the dimmed page. */
    onClose: () => void;
    title: string;
    /** Small link or button next to the title (e.g. "عودة للقائمة"). */
    headerAction?: ReactNode;
    children: ReactNode;
}

// A native <dialog> (top layer, Escape, focus trap) that rises from the bottom
// on phones and sits centered from md. Unlike RouteModal it has no URL: it's
// a step inside the page, not a page. Content taller than 90% of the screen
// scrolls inside it.
const BottomSheet = ({ open, onClose, title, headerAction, children }: BottomSheetProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    // showModal()/close() have no React prop equivalent.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            aria-label={title}
            onClose={onClose}
            // The dialog box is the backdrop's only neighbor: a click on the dialog itself is outside the panel.
            onClick={(event) => {
                if (event.target === event.currentTarget) dialogRef.current?.close();
            }}
            className="sheet-in m-0 mt-auto max-h-[90dvh] w-full max-w-none overflow-hidden rounded-t-3xl border-0 bg-transparent p-0 text-foreground outline-none backdrop:bg-black/60 backdrop:backdrop-blur-sm md:m-auto md:max-w-480 md:rounded-3xl"
        >
            <div className="flex max-h-[90dvh] flex-col bg-surface">
                <header className="flex shrink-0 items-center justify-between gap-12 border-b border-border px-20 py-14">
                    <div className="flex min-w-0 items-center gap-12">
                        <h2 className="font-display text-xl font-bold">{title}</h2>
                        {headerAction}
                    </div>
                    <button
                        type="button"
                        onClick={() => dialogRef.current?.close()}
                        aria-label="إغلاق"
                        className="flex size-40 items-center justify-center rounded-full bg-foreground/10 text-xl transition-colors hover:bg-primary hover:text-background"
                    >
                        <FiX aria-hidden="true" />
                    </button>
                </header>

                <div className="overflow-y-auto overscroll-contain [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin] px-20 pt-16 pb-[max(20px,env(safe-area-inset-bottom))]">
                    {children}
                </div>
            </div>
        </dialog>
    );
};

export default BottomSheet;
