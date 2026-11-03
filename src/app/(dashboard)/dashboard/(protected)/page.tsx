import DashboardTile from "@/components/dashboard/DashboardTile";
import RestaurantSiteLink from "@/components/dashboard/RestaurantSiteLink";
import { formatCount } from "@/lib/arabic-count";
import { getSession } from "@/lib/auth/session";
import { dashboardSummary } from "@/lib/dashboard/summary";
import { formatPrice } from "@/lib/format-price";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";
import { FiGift, FiHome, FiImage, FiInfo, FiLayers, FiMessageCircle, FiShoppingBag, FiStar } from "react-icons/fi";
import { MdOutlineRestaurantMenu } from "react-icons/md";

export const metadata: Metadata = {
    title: "الرئيسية",
};

// Tasks with what's there now. Every tile says "قريباً" until its screen
// exists (phases D1–D6 in DASHBOARD_PLAN).
const DashboardHomePage = async () => {
    const [session, data] = await Promise.all([getSession(), getDashboardSeed()]);
    const count = dashboardSummary(data);

    const items = (n: number) => formatCount(n, { one: "صنف واحد", two: "صنفين", few: "أصناف", many: "صنف" });
    const branches = (n: number) => formatCount(n, { one: "فرع واحد", two: "فرعين", few: "فروع", many: "فرع" });

    const tiles = [
        {
            title: "المنيو",
            icon: MdOutlineRestaurantMenu,
            summary: `${items(count.products)} · ${count.unavailable > 0 ? `غير المتوفر: ${count.unavailable}` : "كلها متوفرة"}`,
        },
        {
            title: "الأقسام",
            icon: FiLayers,
            summary: formatCount(count.categories, { one: "قسم واحد", two: "قسمين", few: "أقسام", many: "قسم" }),
        },
        { title: "الأكثر مبيعاً", icon: FiStar, summary: items(count.bestSellers) },
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

    return (
        <div className="flex flex-col gap-24">
            <div>
                {/* The restaurant being edited, above the welcome (owner); links to its site */}
                <div className="mb-14">
                    <RestaurantSiteLink />
                </div>
                <h1 className="font-display text-2xl font-bold md:text-3xl">أهلاً {session?.name}</h1>
                <p className="mt-6 text-muted">شو بدك تعدّل اليوم؟</p>
            </div>

            <ul className="grid gap-10 md:grid-cols-2 md:gap-14">
                {tiles.map((tile) => (
                    <li key={tile.title}>
                        <DashboardTile {...tile} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DashboardHomePage;
