"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface NavLinkProps {
    href: string;
    /** Style the current page with aria-[current=page]: variants. */
    className: string;
    children: ReactNode;
}

// A nav link that knows if it's the current page (the server layout can't
// see the path). It only sets aria-current; the look stays in the classes.
// In-page anchors (/#about) are never "current".
const NavLink = ({ href, className, children }: NavLinkProps) => {
    const pathname = usePathname();
    const isCurrent = !href.includes("#") && href === pathname;

    return (
        <Link href={href} aria-current={isCurrent ? "page" : undefined} className={className}>
            {children}
        </Link>
    );
};

export default NavLink;
