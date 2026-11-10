import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import TableQrList from "@/components/dashboard/qr/TableQrList";
import { qrPrintPath } from "@/lib/dashboard/qr-print";
import { isTemporaryHost, siteUrl } from "@/lib/site-url";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";
import Link from "next/link";
import { FiPrinter } from "react-icons/fi";

export const metadata: Metadata = {
    title: "أكواد QR",
};

const sectionTitle = "text-lg font-extrabold";

// Server page: the domain warning and the menu code are static; the branch
// list is the client part (table counts live in the browser draft).
const DashboardQrPage = async () => {
    const seed = await getDashboardSeed();

    return (
        <div className="flex flex-col gap-28">
            <DashboardPageHeader
                back={{ href: "/dashboard", label: "الرئيسية" }}
                title="أكواد QR"
                description="اطبع كود لكل طاولة: الزبون بيمسحه، بيفتح المنيو، وطاولته بتنكتب لحالها بالطلب."
            />

            {isTemporaryHost && (
                <p role="alert" className="rounded-xl bg-warning/10 px-12 py-10 text-sm leading-relaxed font-bold text-warning">
                    لسا ما في دومين للمطعم: الأكواد هلق بتفتح على {siteUrl.host}. جرّبها، بس لا تطبعها للطاولات قبل ما ينحط الدومين، لأنو الرابط
                    جوّا الكود.
                </p>
            )}

            <section aria-labelledby="qr-tables-heading" className="flex flex-col gap-12">
                <h2 id="qr-tables-heading" className={sectionTitle}>
                    أكواد الطاولات
                </h2>
                <TableQrList seed={seed} />
                <ul className="flex list-disc flex-col gap-4 ps-20 text-xs leading-relaxed text-muted">
                    <li>إذا زدت طاولات، اطبع بس الجداد (متل: من 11 لـ 14).</li>
                    <li>إذا نقّصت العدد، أكواد الطاولات الزايدة بتفتح المنيو بلا طاولة.</li>
                    <li>تغيير اسم الفرع أو رقمه ما بيحتاج طباعة جديدة. حذف الفرع بيوقّف أكواده.</li>
                </ul>
            </section>

            <section aria-labelledby="qr-menu-heading" className="flex flex-col gap-12">
                <div className="flex flex-col gap-4">
                    <h2 id="qr-menu-heading" className={sectionTitle}>
                        كود المنيو
                    </h2>
                    <p className="text-sm text-muted">بيفتح المنيو بلا طاولة: للمدخل، البوسترات والسوشال.</p>
                </div>
                <Link
                    href={qrPrintPath({ kind: "menu" })}
                    className="inline-flex h-44 items-center gap-8 self-start rounded-full border border-border px-20 font-bold transition-colors hover:border-primary hover:text-primary"
                >
                    <FiPrinter aria-hidden="true" />
                    كود المنيو
                </Link>
            </section>
        </div>
    );
};

export default DashboardQrPage;
