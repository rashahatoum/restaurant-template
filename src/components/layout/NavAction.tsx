"use client";

import type { Action } from "@/types/config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface NavActionProps {
    /** The usual call to action ("اطلب الآن"). */
    action: Action;
    /** Used instead on the page `action` points to (on /menu, "order now" would go nowhere). */
    onTargetPage: Action;
    className: string;
    /** Server-rendered extras after the label (e.g. an arrow icon). */
    children?: ReactNode;
}

// The header's main button. Picks its target from the current path, which
// only the browser knows here.
const NavAction = ({ action, onTargetPage, className, children }: NavActionProps) => {
    const current = usePathname() === action.href ? onTargetPage : action;

    return (
        <Link href={current.href} className={className}>
            {current.label}
            {children}
        </Link>
    );
};

export default NavAction;
