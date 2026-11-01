"use client";

import BottomSheet from "@/components/ui/BottomSheet";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface RouteSheetProps {
    title: string;
    headerAction?: ReactNode;
    children: ReactNode;
}

// A BottomSheet for an intercepted route (app/(site)/@modal): always open,
// and closing goes back in history, so the back button closes it too and
// the page underneath keeps its scroll.
const RouteSheet = ({ title, headerAction, children }: RouteSheetProps) => {
    const router = useRouter();

    return (
        <BottomSheet open onClose={() => router.back()} title={title} headerAction={headerAction}>
            {children}
        </BottomSheet>
    );
};

export default RouteSheet;
