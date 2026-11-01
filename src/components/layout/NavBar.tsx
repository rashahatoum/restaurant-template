"use client";

import { restaurantConfig } from "@/config/restaurant";
import { useCartLines } from "@/hooks/useCart";
import { countItems, formatPieces } from "@/lib/cart";
import { toTelHref, toWhatsAppHref } from "@/lib/contact";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowLeft, FiClock, FiMenu, FiPhone, FiShoppingBag, FiX } from "react-icons/fi";

interface NavBarProps {
    /** Shown in the mobile menu (from getSiteInfo). */
    whatsAppNumber?: string;
    phoneNumber?: string;
    openingHours?: string;
}

const { links, orderAction, menuPageAction } = restaurantConfig.navbar;

/** Past this scroll offset the bar turns solid and compact. */
const SCROLLED_AFTER = 16;

/** Same look for the round icon buttons (cart, menu, close): 44px touch targets. */
const iconButtonClasses =
    "relative flex size-44 items-center justify-center rounded-full bg-foreground/10 text-xl text-foreground transition-colors hover:bg-primary hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

// Fixed site header. Over the hero it stays see-through; once the page
// scrolls it turns solid with a blur and gets shorter, so the menu and the
// cart are always one tap away. The current page's link is underlined.
// Phones: logo + cart + menu button; the menu is a full-screen <dialog>.
const NavBar = ({ whatsAppNumber, phoneNumber, openingHours }: NavBarProps) => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const cartCount = countItems(useCartLines());
    const dialogRef = useRef<HTMLDialogElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    /** Set when the menu is closed by a tap (✕ or a link), not the keyboard. */
    const closedByPointer = useRef(false);

    // showModal() has no React prop equivalent; it gives us Escape-to-close,
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

    // Scroll position is browser state: read it on scroll (passive, cheap).
    useEffect(() => {
        const update = () => setScrolled(window.scrollY > SCROLLED_AFTER);
        update();
        window.addEventListener("scroll", update, { passive: true });
        return () => window.removeEventListener("scroll", update);
    }, []);

    /** Taps inside the menu (✕, links): remember it, so the returned focus stays quiet. */
    const closeMenu = () => {
        closedByPointer.current = true;
        setIsOpen(false);
    };

    // The dialog hands focus back to the menu button (good for keyboards). After
    // a tap, Chrome would draw its focus ring there; drop focus quietly instead.
    const handleDialogClose = () => {
        setIsOpen(false);
        if (closedByPointer.current) {
            closedByPointer.current = false;
            requestAnimationFrame(() => toggleRef.current?.blur());
        }
    };
    /** Only real pages can be "current"; in-page anchors (/#about) never are. */
    const isCurrent = (href: string) => !href.includes("#") && href === pathname;
    /** On the menu itself, "order now" would link to the same page: invite people to the site instead. */
    const action = pathname === orderAction.href ? menuPageAction : orderAction;

    const cartLabel = cartCount > 0 ? `السلة، فيها ${formatPieces(cartCount)}` : "السلة";
    const cartBadge = cartCount > 0 && (
        <span
            aria-hidden="true"
            className="absolute -top-2 -inset-e-2 flex h-18 min-w-18 items-center justify-center rounded-full bg-primary px-4 text-xs font-extrabold text-background tabular-nums"
        >
            {cartCount}
        </span>
    );

    return (
        <header
            className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300 ${
                scrolled
                    ? "bg-background/85 shadow-[0_1px_0_var(--color-border)] backdrop-blur-md"
                    : "bg-linear-to-b from-background/70 to-transparent"
            }`}
        >
            <nav
                aria-label="التنقل الرئيسي"
                className={`flex w-full items-center justify-between gap-16 px-page-gutter transition-[height] duration-300 ${
                    scrolled ? "h-64" : "h-80"
                }`}
            >
                <Link
                    href="/"
                    aria-label={`${restaurantConfig.name}، الصفحة الرئيسية`}
                    className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    <Image
                        src={restaurantConfig.logo}
                        alt=""
                        width={2172}
                        height={724}
                        sizes="140px"
                        className={`h-auto transition-[width] duration-300 ${scrolled ? "w-120" : "w-140"}`}
                    />
                </Link>

                {/* =========================
                    DESKTOP LINKS (text only)
                ========================== */}

                <ul className="hidden items-center gap-28 md:flex lg:gap-36">
                    {links.map((link) => {
                        const current = isCurrent(link.href);
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    aria-current={current ? "page" : undefined}
                                    className={`relative py-6 text-base font-bold transition-colors after:absolute after:inset-x-0 after:-bottom-2 after:h-2 after:origin-center after:rounded-full after:bg-primary after:transition-transform hover:text-primary ${
                                        current ? "text-primary after:scale-x-100" : "text-foreground after:scale-x-0 hover:after:scale-x-100"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                {/* =========================
                    ACTIONS
                ========================== */}

                <div className="flex items-center gap-10 md:gap-14">
                    {/* Opens as a popup over the current page (@modal/(.)cart); scroll={false} keeps its place */}
                    <Link href="/cart" scroll={false} aria-label={cartLabel} className={iconButtonClasses}>
                        <FiShoppingBag aria-hidden="true" />
                        {cartBadge}
                    </Link>

                    <Link
                        href={action.href}
                        className="hidden h-44 items-center rounded-full bg-primary px-20 font-bold text-background transition-[filter] hover:brightness-110 md:flex"
                    >
                        {action.label}
                    </Link>

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
                </div>

                {/* =========================
                    MOBILE MENU
                ========================== */}

                <dialog
                    ref={dialogRef}
                    id="mobile-menu"
                    aria-label="القائمة"
                    onClose={handleDialogClose}
                    className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-y-auto border-0 bg-background p-0 text-foreground outline-none backdrop:bg-black/60 md:hidden"
                >
                    {/* Warm glow, like the hero: no photo behind the links.
                        Clipped by its own box so it never makes the menu scroll. */}
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                        <span className="absolute -bottom-160 -inset-e-160 size-420 rounded-full bg-primary/25 blur-3xl" />
                    </span>

                    {isOpen && (
                        <div className="relative flex min-h-full flex-col px-page-gutter pb-32">
                            <div className="flex h-80 shrink-0 items-center justify-between">
                                <Link
                                    href="/"
                                    onClick={closeMenu}
                                    aria-label="الصفحة الرئيسية"
                                    className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                    <Image
                                        src={restaurantConfig.logo}
                                        alt=""
                                        width={2172}
                                        height={724}
                                        sizes="140px"
                                        className="h-auto w-140"
                                    />
                                </Link>
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

                            <ul className="mt-24 flex flex-col">
                                {links.map((link, index) => {
                                    const current = isCurrent(link.href);
                                    return (
                                        <li
                                            key={link.href}
                                            className="rise-in border-b border-border/70"
                                            style={{ "--delay": `${60 + index * 50}ms` } as CSSProperties}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={closeMenu}
                                                aria-current={current ? "page" : undefined}
                                                className={`flex items-center justify-between py-16 font-display text-2xl font-bold transition-colors hover:text-primary ${
                                                    current ? "text-primary" : "text-foreground"
                                                }`}
                                            >
                                                {link.label}
                                                <FiArrowLeft aria-hidden="true" className="text-xl opacity-60" />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div
                                className="rise-in mt-auto flex flex-col gap-12 pt-32"
                                style={{ "--delay": `${60 + links.length * 50}ms` } as CSSProperties}
                            >
                                <Link
                                    href={action.href}
                                    onClick={closeMenu}
                                    className="flex h-54 items-center justify-center gap-8 rounded-full bg-primary text-lg font-extrabold text-background"
                                >
                                    {action.label}
                                    <FiArrowLeft aria-hidden="true" />
                                </Link>

                                {(whatsAppNumber || phoneNumber) && (
                                    <div className="grid grid-cols-2 gap-10">
                                        {whatsAppNumber && (
                                            <a
                                                href={toWhatsAppHref(whatsAppNumber)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex h-48 items-center justify-center gap-8 rounded-full border border-border font-bold transition-colors hover:border-primary hover:text-primary"
                                            >
                                                <FaWhatsapp aria-hidden="true" className="text-lg" />
                                                واتساب
                                            </a>
                                        )}
                                        {phoneNumber && (
                                            <a
                                                href={toTelHref(phoneNumber)}
                                                className="flex h-48 items-center justify-center gap-8 rounded-full border border-border font-bold transition-colors hover:border-primary hover:text-primary"
                                            >
                                                <FiPhone aria-hidden="true" />
                                                اتصال
                                            </a>
                                        )}
                                    </div>
                                )}

                                {openingHours && (
                                    <p className="flex items-center justify-center gap-6 text-sm text-muted">
                                        <FiClock aria-hidden="true" className="shrink-0" />
                                        {openingHours}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </dialog>
            </nav>
        </header>
    );
};

export default NavBar;
