"use client";

import BottomSheet from "@/components/ui/BottomSheet";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface RouteSheetProps {
    /** The route this sheet stands for, e.g. "/cart". */
    path: string;
    title: string;
    headerAction?: ReactNode;
    children: ReactNode;
}

// A BottomSheet for an intercepted route (app/(site)/@modal): open while the
// URL is its route; closing goes back in history, so the back button closes
// it too and the page underneath keeps its scroll.
// A parallel slot keeps showing its last page when a link leads to a route it
// doesn't match ("عودة للقائمة"), so the sheet hides itself once the URL
// moves on. (A catch-all slot page did this before, but it overlapped
// /menu/[itemId] and sent `next dev` into a reload loop.)
const RouteSheet = ({ path, title, headerAction, children }: RouteSheetProps) => {
    const router = useRouter();
    const pathname = usePathname();

    if (pathname !== path) return null;

    return (
        <BottomSheet open onClose={() => router.back()} title={title} headerAction={headerAction}>
            {children}
        </BottomSheet>
    );
};

export default RouteSheet;
