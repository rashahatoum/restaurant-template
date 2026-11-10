"use client";

import ToastViewport from "@/components/dashboard/feedback/ToastViewport";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useToast } from "@/hooks/useToast";
import type { DashboardData } from "@/types/dashboard";
import OrderingForm from "./OrderingForm";

// Waits for the browser draft (initial values are taken once) and remounts the
// form with the saved values after a save or a reset. The key includes the
// restaurant info too: the form shows its numbers and branches.
const OrderingEditor = ({ seed, restaurantName }: { seed: DashboardData; restaurantName: string }) => {
    const { ordering, siteInfo, products } = useDashboardData(seed);
    const isHydrated = useIsHydrated();
    const { toast, show, hide } = useToast();

    if (!isHydrated) return <div aria-busy="true" className="min-h-480" />;

    return (
        <>
            <OrderingForm
                key={JSON.stringify({ ordering, phones: siteInfo.phones, branches: siteInfo.branches })}
                ordering={ordering}
                info={siteInfo}
                products={products}
                restaurantName={restaurantName}
                onSaved={() => show({ tone: "success", message: "انحفظت إعدادات الطلب" })}
            />
            <ToastViewport toast={toast} onClose={hide} />
        </>
    );
};

export default OrderingEditor;
