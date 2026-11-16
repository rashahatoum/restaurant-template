// The dashboard areas as the owner reads them, in the dashboard's order.
// Shared by the notice at the top of every dashboard page and the
// «رجّع البيانات الأصلية» text, so both name the areas that are really live.

import type { LiveArea } from "@/types/dashboard";

export const AREA_LABELS: readonly { key: LiveArea; label: string }[] = [
    { key: "menu", label: "الأصناف والأقسام" },
    { key: "offers", label: "العروض" },
    { key: "banners", label: "البانر" },
    { key: "reviews", label: "الآراء" },
    { key: "home", label: "الواجهة و«من نحن»" },
    { key: "info", label: "معلومات المطعم" },
    { key: "ordering", label: "الطلب" },
];

/** The labels of the live areas and of the ones still kept in this browser. */
export function splitAreas(liveAreas: readonly LiveArea[]): { live: string[]; local: string[] } {
    return {
        live: AREA_LABELS.filter((area) => liveAreas.includes(area.key)).map((area) => area.label),
        local: AREA_LABELS.filter((area) => !liveAreas.includes(area.key)).map((area) => area.label),
    };
}
