"use client";

import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import DashboardTile from "@/components/dashboard/DashboardTile";
import ToastViewport from "@/components/dashboard/feedback/ToastViewport";
import { useDashboardData, useHasDraft } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/useToast";
import { formatCount } from "@/lib/arabic-count";
import { dashboardSummary } from "@/lib/dashboard/summary";
import { repository } from "@/lib/dashboard/repository";
import { formatPrice } from "@/lib/format-price";
import type { DashboardData } from "@/types/dashboard";
import { useState } from "react";
import { FiGift, FiHome, FiImage, FiInfo, FiLayers, FiMessageCircle, FiRotateCcw, FiShoppingBag, FiStar } from "react-icons/fi";
import { MdOutlineRestaurantMenu } from "react-icons/md";

const items = (n: number) => formatCount(n, { one: "صنف واحد", two: "صنفين", few: "أصناف", many: "صنف" });
const branches = (n: number) => formatCount(n, { one: "فرع واحد", two: "فرعين", few: "فروع", many: "فرع" });

// The task tiles, counted from what the owner sees now (edits included),
// and the way back to the original data. Tiles without an href say "قريباً".
const DashboardHome = ({ seed }: { seed: DashboardData }) => {
    const data = useDashboardData(seed);
    const hasDraft = useHasDraft();
    const { toast, show, hide } = useToast();
    const [isConfirming, setIsConfirming] = useState(false);
    const count = dashboardSummary(data);

    const tiles = [
        {
            title: "المنيو",
            href: "/dashboard/menu",
            icon: MdOutlineRestaurantMenu,
            summary: `${items(count.products)} · ${count.unavailable > 0 ? `غير المتوفر: ${count.unavailable}` : "كلها متوفرة"}`,
        },
        {
            title: "الأكثر مبيعاً",
            // Marked with the star in the product list
            href: "/dashboard/menu",
            icon: FiStar,
            summary: items(count.bestSellers),
        },
        {
            title: "الأقسام",
            href: "/dashboard/categories",
            icon: FiLayers,
            summary: formatCount(count.categories, { one: "قسم واحد", two: "قسمين", few: "أقسام", many: "قسم" }),
        },
        {
            title: "العروض",
            icon: FiGift,
            summary: count.offersEnabled
                ? formatCount(count.activeOffers, { one: "عرض واحد فعّال", two: "عرضين فعّالين", few: "عروض فعّالة", many: "عرض فعّال" })
                : "القسم مطفي",
        },
        {
            title: "البانر",
            icon: FiImage,
            summary: formatCount(count.activeBanners, { one: "شريحة وحدة", two: "شريحتين", few: "شرائح", many: "شريحة" }),
        },
        {
            title: "التقييمات",
            icon: FiMessageCircle,
            summary: count.reviewsEnabled
                ? formatCount(count.visibleReviews, { one: "تقييم واحد ظاهر", two: "تقييمين ظاهرين", few: "تقييمات ظاهرة", many: "تقييم ظاهر" })
                : "القسم مطفي",
        },
        { title: "الواجهة و«من نحن»", icon: FiHome, summary: "نصوص الصفحة الرئيسية" },
        {
            title: "الطلب والتوصيل",
            icon: FiShoppingBag,
            summary: [
                count.deliveryFee !== null ? `توصيل ${formatPrice(count.deliveryFee)}` : "التوصيل مطفي",
                count.dineInBranches > 0 ? `طاولات: ${branches(count.dineInBranches)}` : "الطاولات مطفية",
            ].join(" · "),
        },
        {
            title: "معلومات المطعم",
            icon: FiInfo,
            summary: `${formatCount(count.phones, { one: "رقم واحد", two: "رقمين", few: "أرقام", many: "رقم" })} · ${branches(count.branches)}`,
        },
    ];

    const reset = async () => {
        setIsConfirming(false);
        const result = await repository.resetToOriginal();
        show(
            result.ok
                ? { tone: "success", message: "رجعت البيانات الأصلية" }
                : { tone: "error", message: result.error.message }
        );
    };

    return (
        <>
            <ul className="grid gap-10 md:grid-cols-2 md:gap-14">
                {tiles.map((tile) => (
                    <li key={tile.title}>
                        <DashboardTile {...tile} />
                    </li>
                ))}
            </ul>

            {/* Only when this device has edits */}
            {hasDraft && (
                <div className="flex flex-col items-start gap-10 rounded-2xl border border-dashed border-border p-16 text-sm md:flex-row md:items-center md:justify-between">
                    <p className="text-muted">عدّلت على هالجهاز. بدك تمسح كل تعديلاتك وترجع للبيانات الأصلية؟</p>
                    <button
                        type="button"
                        onClick={() => setIsConfirming(true)}
                        className="inline-flex h-40 shrink-0 items-center gap-6 rounded-full border border-border px-14 font-bold transition-colors hover:border-danger hover:text-danger"
                    >
                        <FiRotateCcw aria-hidden="true" />
                        رجّع البيانات الأصلية
                    </button>
                </div>
            )}

            <ConfirmDialog
                open={isConfirming}
                title="ترجع للبيانات الأصلية؟"
                message="رح تنمسح كل التعديلات اللي عملتها على هالجهاز (الأسعار، المتوفر، الأكثر مبيعاً). ما فيك تتراجع عن هالخطوة."
                confirmLabel="إي، امسح تعديلاتي"
                onConfirm={reset}
                onCancel={() => setIsConfirming(false)}
            />

            <ToastViewport toast={toast} onClose={hide} />
        </>
    );
};

export default DashboardHome;
