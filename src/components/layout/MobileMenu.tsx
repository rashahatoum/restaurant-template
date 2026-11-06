"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import { iconButtonClasses } from "./nav-styles";

interface MobileMenuProps {
    /** Server-rendered top row content (the logo link), beside the ✕. */
    header: ReactNode;
    /** Server-rendered menu body: links, call to action, contact, hours. */
    children: ReactNode;
}

// Phones only: the ☰ button and a full-screen <dialog>. The content comes
// from the server; this component only opens, closes and moves focus.
// Any link tap inside closes it (one delegated listener, so the links
// themselves stay server-rendered).
const MobileMenu = ({ header, children }: MobileMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    /** Set when the menu is closed by a tap (✕ or a link), not the keyboard. */
    const closedByPointer = useRef(false);

    // showModal() has no React prop equivalent; it gives Escape-to-close,
    // a focus trap, and focus return to the toggle for free.
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (isOpen && !dialog.open) {
            dialog.showModal();
            // showModal() focuses the first link (the logo); the ✕ is the natural first stop.
            closeButtonRef.current?.focus();
        }
        if (!isOpen && dialog.open) dialog.close();
    }, [isOpen]);

    const closeMenu = () => {
        closedByPointer.current = true;
        setIsOpen(false);
    };

    // The dialog hands focus back to the ☰ button (good for keyboards). After
    // a tap, Chrome would draw its focus ring there; drop focus quietly instead.
    const handleDialogClose = () => {
        setIsOpen(false);
        if (closedByPointer.current) {
            closedByPointer.current = false;
            requestAnimationFrame(() => toggleRef.current?.blur());
        }
    };

    const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
        if (event.target instanceof Element && event.target.closest("a")) closeMenu();
    };

    return (
        <>
            <button
                ref={toggleRef}
                type="button"
                aria-label="فتح القائمة"
                aria-expanded={isOpen}
                aria-controls="mobile-menu"
                className={`${iconButtonClasses} md:hidden`}
                onClick={() => setIsOpen(true)}
            >
                <FiMenu aria-hidden="true" />
            </button>

            <dialog
                ref={dialogRef}
                id="mobile-menu"
                aria-label="القائمة"
                onClose={handleDialogClose}
                onClick={handleClick}
                className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-y-auto border-0 bg-background p-0 text-foreground outline-none backdrop:bg-black/60 md:hidden"
            >
                {/* Warm glow, like the hero: no photo behind the links.
                    Clipped by its own box so it never makes the menu scroll. */}
                <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                    <span className="absolute -bottom-160 -inset-e-160 size-420 rounded-full bg-primary/25 blur-3xl" />
                </span>

                {/* Mounted only while open, so the entry animation plays each time */}
                {isOpen && (
                    <div className="relative flex min-h-full flex-col px-page-gutter pb-32">
                        <div className="flex h-80 shrink-0 items-center justify-between">
                            {header}
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={closeMenu}
                                aria-label="إغلاق القائمة"
                                className={iconButtonClasses}
                            >
                                <FiX aria-hidden="true" />
                            </button>
                        </div>
                        {children}
                    </div>
                )}
            </dialog>
        </>
    );
};

export default MobileMenu;
