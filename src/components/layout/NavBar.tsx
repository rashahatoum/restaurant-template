import { restaurantConfig } from "@/config/restaurant";
import { toTelHref, toWhatsAppHref } from "@/lib/contact";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowLeft, FiClock, FiPhone, FiShoppingBag } from "react-icons/fi";
import CartLink from "./CartLink";
import MobileMenu from "./MobileMenu";
import NavAction from "./NavAction";
import NavLink from "./NavLink";
import ScrollAwareHeader from "./ScrollAwareHeader";

interface NavBarProps {
    /** Shown in the mobile menu (from getSiteInfo). */
    whatsAppNumber?: string;
    phoneNumber?: string;
    openingHours?: string;
}

const { links, orderAction, menuPageAction } = restaurantConfig.navbar;

// Fixed site header, rendered on the server. Over the hero it stays
// see-through; once the page scrolls it turns solid and shorter, so the menu
// and the cart are always one tap away. The current page's link is underlined.
// Only the browser-dependent bits are client islands: ScrollAwareHeader
// (scroll → data-scrolled), NavLink (current page → aria-current), NavAction
// (its target depends on the page), CartLink (the count) and MobileMenu
// (open/close). Their looks stay in the classes below.
const NavBar = ({ whatsAppNumber, phoneNumber, openingHours }: NavBarProps) => {
    const logo = (width: string) => (
        <Image
            src={restaurantConfig.logo}
            alt=""
            width={2172}
            height={724}
            sizes="140px"
            className={`h-auto ${width}`}
        />
    );

    return (
        <ScrollAwareHeader className="fixed inset-x-0 top-0 z-50 bg-linear-to-b from-background/70 to-transparent transition-[background-color,box-shadow] duration-300 data-[scrolled=true]:bg-background/85 data-[scrolled=true]:bg-none data-[scrolled=true]:shadow-[0_1px_0_var(--color-border)] data-[scrolled=true]:backdrop-blur-md">
            <nav
                aria-label="التنقل الرئيسي"
                className="flex h-80 w-full items-center justify-between gap-16 px-page-gutter transition-[height] duration-300 group-data-[scrolled=true]/header:h-64"
            >
                <Link
                    href="/"
                    aria-label={`${restaurantConfig.name}، الصفحة الرئيسية`}
                    className="shrink-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                    {logo("w-140 transition-[width] duration-300 group-data-[scrolled=true]/header:w-120")}
                </Link>

                {/* =========================
                    DESKTOP LINKS (text only)
                ========================== */}

                <ul className="hidden items-center gap-28 md:flex lg:gap-36">
                    {links.map((link) => (
                        <li key={link.href}>
                            <NavLink
                                href={link.href}
                                className="relative py-6 text-base font-bold text-foreground transition-colors after:absolute after:inset-x-0 after:-bottom-2 after:h-2 after:origin-center after:scale-x-0 after:rounded-full after:bg-primary after:transition-transform hover:text-primary hover:after:scale-x-100 aria-[current=page]:text-primary aria-[current=page]:after:scale-x-100"
                            >
                                {link.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* =========================
                    ACTIONS
                ========================== */}

                <div className="flex items-center gap-10 md:gap-14">
                    <CartLink icon={<FiShoppingBag aria-hidden="true" />} />

                    <NavAction
                        action={orderAction}
                        onTargetPage={menuPageAction}
                        className="hidden h-44 items-center rounded-full bg-primary px-20 font-bold text-background transition-[filter] hover:brightness-110 md:flex"
                    />

                    {/* =========================
                        MOBILE MENU (content rendered here, on the server)
                    ========================== */}

                    <MobileMenu
                        header={
                            <Link
                                href="/"
                                aria-label="الصفحة الرئيسية"
                                className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                {logo("w-140")}
                            </Link>
                        }
                    >
                        <ul className="mt-24 flex flex-col">
                            {links.map((link, index) => (
                                <li
                                    key={link.href}
                                    className="rise-in border-b border-border/70"
                                    style={{ "--delay": `${60 + index * 50}ms` } as CSSProperties}
                                >
                                    <NavLink
                                        href={link.href}
                                        className="flex items-center justify-between py-16 font-display text-2xl font-bold text-foreground transition-colors hover:text-primary aria-[current=page]:text-primary"
                                    >
                                        {link.label}
                                        <FiArrowLeft aria-hidden="true" className="text-xl opacity-60" />
                                    </NavLink>
                                </li>
                            ))}
                        </ul>

                        <div
                            className="rise-in mt-auto flex flex-col gap-12 pt-32"
                            style={{ "--delay": `${60 + links.length * 50}ms` } as CSSProperties}
                        >
                            <NavAction
                                action={orderAction}
                                onTargetPage={menuPageAction}
                                className="flex h-54 items-center justify-center gap-8 rounded-full bg-primary text-lg font-extrabold text-background"
                            >
                                <FiArrowLeft aria-hidden="true" />
                            </NavAction>

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
                    </MobileMenu>
                </div>
            </nav>
        </ScrollAwareHeader>
    );
};

export default NavBar;
