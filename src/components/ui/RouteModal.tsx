"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { FiX } from "react-icons/fi";

/** Taps inside these (size, add…) don't close the modal. */
const INTERACTIVE = "button, a, input, label, select, textarea, fieldset";

interface RouteModalProps {
    children: ReactNode;
    /** id of the (possibly visually hidden) heading that names the dialog. */
    labelledBy: string;
}

// Shell for an intercepted route (app/(site)/@modal): a native <dialog>
// (top layer, Escape, focus handling). No panel or border, just the content
// over the blurred page, plus a light ✕ in the corner.
// Any tap outside the controls closes it; closing goes back in history, which unmounts the slot
// and restores the page underneath with its scroll.
const RouteModal = ({ children, labelledBy }: RouteModalProps) => {
    const router = useRouter();
    const dialogRef = useRef<HTMLDialogElement>(null);

    // showModal() has no React prop equivalent.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (dialog && !dialog.open) dialog.showModal();
    }, []);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={labelledBy}
            // Escape and taps both end here.
            onClose={() => router.back()}
            onClick={(event) => {
                if (!(event.target as Element).closest(INTERACTIVE)) dialogRef.current?.close();
            }}
            // border-0 / outline-none / bg-transparent remove the browser's dialog frame;
            // the backdrop only blurs (no tint).
            className="modal-in m-0 size-full max-h-none max-w-none cursor-pointer overflow-hidden border-0 bg-transparent p-0 text-foreground outline-none backdrop:bg-transparent backdrop:backdrop-blur-xl"
        >
            {/* A visible way out too, for people who don't think to tap anywhere */}
            <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label="إغلاق"
                className="absolute top-16 inset-e-16 z-10 flex size-44 items-center justify-center rounded-full bg-foreground/10 text-2xl text-foreground backdrop-blur-sm transition-colors hover:bg-primary hover:text-background md:top-24 md:inset-e-24"
            >
                <FiX aria-hidden="true" />
            </button>

            <div className="flex size-full items-center justify-center px-page-gutter py-24">{children}</div>
        </dialog>
    );
};

export default RouteModal;
