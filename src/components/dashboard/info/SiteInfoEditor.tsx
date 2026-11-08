"use client";

import ToastViewport from "@/components/dashboard/feedback/ToastViewport";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useToast } from "@/hooks/useToast";
import type { DashboardData } from "@/types/dashboard";
import SiteInfoForm from "./SiteInfoForm";

// Waits for the browser draft (initial values are taken once) and remounts the
// form with the saved values after a save or a reset (key = the saved info).
const SiteInfoEditor = ({ seed }: { seed: DashboardData }) => {
    const { siteInfo, ordering } = useDashboardData(seed);
    const isHydrated = useIsHydrated();
    const { toast, show, hide } = useToast();

    if (!isHydrated) return <div aria-busy="true" className="min-h-480" />;

    return (
        <>
            <SiteInfoForm
                key={JSON.stringify(siteInfo)}
                info={siteInfo}
                ordering={ordering}
                onSaved={() => show({ tone: "success", message: "انحفظت معلومات المطعم" })}
            />
            <ToastViewport toast={toast} onClose={hide} />
        </>
    );
};

export default SiteInfoEditor;
