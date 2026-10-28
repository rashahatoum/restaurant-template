import { platformConfig } from "@/config/platform";
import { restaurantConfig } from "@/config/restaurant";
import { formatPhone, toTelHref, toWhatsAppHref } from "@/lib/contact";
import { getSiteInfo } from "@/services/content";
import type { SocialPlatform } from "@/types/content";
import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { FiClock, FiMapPin, FiPhone } from "react-icons/fi";

const socialIcons: Record<SocialPlatform, IconType> = {
    facebook: FaFacebookF,
    instagram: FaInstagram,
    tiktok: FaTiktok,
};

const headingClasses = "font-display text-xl font-bold text-foreground";
const linkClasses = "transition-colors hover:text-primary";

// Server Component, rendered by (site)/layout on every public page.
// Brand settings come from config; phones/branches/hours from content (dashboard).
const Footer = async () => {
    const info = await getSiteInfo();
    // Evaluated at build time for static pages, refreshed on every deploy.
    const year = new Date().getFullYear();

    return (
        <footer className="relative isolate bg-surface text-muted">
            {/* Orange top border: a sharp line fading at both ends + a blurred glow under it */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0">
                <div className="h-2 bg-linear-to-r from-transparent via-primary to-transparent" />
                <div className="-mt-2 h-24 bg-linear-to-r from-transparent via-primary/40 to-transparent blur-xl" />
            </div>

            {/* lg: fixed-width brand column, the other three size to their
                content and share the remaining space evenly (justify-between). */}
            <div className="grid gap-40 px-page-gutter py-64 sm:grid-cols-2 lg:grid-cols-[280px_auto_auto_auto] lg:justify-between lg:gap-48">
                {/* =========================
                    BRAND
                ========================== */}

                <div className="flex max-w-280 flex-col items-start gap-20">
                    <Link
                        href="/"
                        aria-label={restaurantConfig.name}
                        className="relative isolate"
                    >
                        {/* Primary glow behind the logo */}
                        <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-primary/35 blur-2xl"
                        />
                        <Image
                            src={restaurantConfig.logo}
                            alt={restaurantConfig.name}
                            width={2172}
                            height={724}
                            sizes="240px"
                            className="h-auto w-200 md:w-240"
                        />
                    </Link>

                    {/* pre-line: line breaks typed in the dashboard are kept */}
                    <p className="whitespace-pre-line leading-relaxed">{info.tagline}</p>
                </div>

                {/* =========================
                    QUICK LINKS (same as the NavBar)
                ========================== */}

                <nav aria-labelledby="footer-links-title" className="flex flex-col gap-16">
                    <h2 id="footer-links-title" className={headingClasses}>
                        روابط سريعة
                    </h2>

                    <ul className="flex flex-col gap-10">
                        {restaurantConfig.navbar.links.map((link) => (
                            <li key={link.href}>
                                <Link href={link.href} className={linkClasses}>
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* =========================
                    CONTACT (#contact)
                ========================== */}

                <div id="contact" className="flex flex-col gap-16">
                    <h2 className={headingClasses}>تواصل معنا</h2>

                    <ul className="flex flex-col gap-12">
                        {/* One action per number: WhatsApp when available, otherwise a call */}
                        {info.phones.map((phone) => {
                            const Icon = phone.hasWhatsApp ? FaWhatsapp : FiPhone;

                            return (
                                <li key={phone.number}>
                                    <a
                                        href={
                                            phone.hasWhatsApp
                                                ? toWhatsAppHref(phone.number)
                                                : toTelHref(phone.number)
                                        }
                                        {...(phone.hasWhatsApp && {
                                            target: "_blank",
                                            rel: "noopener noreferrer",
                                            "aria-label": `واتساب ${formatPhone(phone.number)}`,
                                        })}
                                        className={`flex items-center gap-10 ${linkClasses}`}
                                    >
                                        <span className="flex size-32 shrink-0 items-center justify-center rounded-full bg-primary/15 text-lg text-primary">
                                            <Icon aria-hidden="true" />
                                        </span>
                                        {/* Numbers read left-to-right inside RTL text */}
                                        <span dir="ltr">{formatPhone(phone.number)}</span>
                                    </a>
                                </li>
                            );
                        })}
                    </ul>

                    {info.socialLinks && info.socialLinks.length > 0 && (
                        <ul className="flex gap-12">
                            {info.socialLinks.map((social) => {
                                const Icon = socialIcons[social.platform];
                                return (
                                    <li key={social.platform}>
                                        <a
                                            href={social.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={social.platform}
                                            className="flex size-36 items-center justify-center rounded-full border border-border transition-colors hover:border-primary hover:text-primary"
                                        >
                                            <Icon aria-hidden="true" />
                                        </a>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* =========================
                    LOCATION (#location)
                ========================== */}

                <div id="location" className="flex flex-col gap-16">
                    <h2 className={headingClasses}>موقعنا</h2>

                    <ul className="flex flex-col gap-16">
                        {info.branches.map((branch) => (
                            <li key={branch.id} className="flex gap-8">
                                <FiMapPin aria-hidden="true" className="mt-4 shrink-0 text-primary" />

                                <div className="flex flex-col gap-4">
                                    <span className="font-bold text-foreground">
                                        {branch.name}
                                    </span>
                                    <span className="leading-relaxed">{branch.address}</span>

                                    {branch.mapUrl && (
                                        <a
                                            href={branch.mapUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm font-bold text-primary hover:underline"
                                        >
                                            افتح على الخريطة
                                        </a>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>

                    {info.openingHours && (
                        <div className="flex gap-8">
                            <FiClock aria-hidden="true" className="mt-4 shrink-0 text-primary" />

                            <div className="flex flex-col gap-4">
                                <span className="font-bold text-foreground">أوقات العمل</span>
                                <span>{info.openingHours}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* =========================
                COPYRIGHT
            ========================== */}

            <div className="flex flex-col items-center gap-8 border-t border-border px-page-gutter py-20 text-center text-sm">
                <p>
                    © {year} {restaurantConfig.name}. جميع الحقوق محفوظة
                </p>

                <p className="flex flex-wrap items-center justify-center gap-6">
                    صُنع بواسطة
                    {platformConfig.url ? (
                        <a
                            href={platformConfig.url}
                            target="_blank"
                            rel="noopener"
                            dir="ltr"
                            className="font-bold text-primary hover:underline"
                        >
                            {platformConfig.name}
                        </a>
                    ) : (
                        <span dir="ltr" className="font-bold text-primary">
                            {platformConfig.name}
                        </span>
                    )}
                    {/* Platform contact, pre-filled so leads say where they came from */}
                    <a
                        href={toWhatsAppHref(
                            platformConfig.whatsapp,
                            `مرحباً، شفت موقع ${restaurantConfig.name} وبدي أعرف أكتر عن ${platformConfig.name}`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`تواصل مع ${platformConfig.name} على واتساب`}
                        className="flex size-28 items-center justify-center rounded-full bg-primary/15 text-base text-primary transition-colors hover:bg-primary hover:text-background"
                    >
                        <FaWhatsapp aria-hidden="true" />
                    </a>
                </p>
            </div>
        </footer>
    );
};

export default Footer;
