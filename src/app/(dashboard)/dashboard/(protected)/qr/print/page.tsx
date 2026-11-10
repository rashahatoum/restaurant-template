import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import PrintButton from "@/components/dashboard/qr/PrintButton";
import QrSheet, { type QrCard } from "@/components/dashboard/qr/QrSheet";
import { restaurantConfig } from "@/config/restaurant";
import { parseQrPrint } from "@/lib/dashboard/qr-print";
import { absoluteUrl, isTemporaryHost, siteUrl } from "@/lib/site-url";
import { tableShortPath } from "@/lib/table-session";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "طباعة أكواد QR",
};

interface QrPrintPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// Server page: the QR codes are made here (no QR library in the browser). Only
// the sheet prints; the dashboard header and this page's controls are hidden.
const QrPrintPage = async ({ searchParams }: QrPrintPageProps) => {
    const request = parseQrPrint(await searchParams);
    const back = { href: "/dashboard/qr", label: "أكواد QR" };

    if (!request) {
        return (
            <div className="flex flex-col gap-20">
                <DashboardPageHeader back={back} title="الرابط ناقص" />
                <p className="text-sm text-muted">
                    ما عرفنا شو بدك تطبع. ارجع لـ
                    <Link href="/dashboard/qr" className="font-bold text-primary underline underline-offset-4">
                        أكواد QR
                    </Link>{" "}
                    واختار من هنيك.
                </p>
            </div>
        );
    }

    const cards: QrCard[] =
        request.kind === "menu"
            ? [{ title: "قائمة الطعام", cta: "امسح الكود وشوف المنيو", subtitle: siteUrl.host, link: absoluteUrl("/menu") }]
            : Array.from({ length: request.to - request.from + 1 }, (_, index) => {
                  const table = request.from + index;
                  return {
                      title: `طاولة ${table}`,
                      cta: "امسح الكود واطلب من طاولتك",
                      subtitle: request.branchName,
                      link: absoluteUrl(tableShortPath(request.branchId, table)),
                  };
              });
    const title = request.kind === "menu" ? "كود المنيو" : `طاولات ${request.branchName}`;
    const { background, accent } = restaurantConfig.seo.shareColors;

    return (
        <div className="flex flex-col gap-20 print:gap-0">
            <div className="flex flex-col gap-14 print:hidden">
                <DashboardPageHeader
                    back={back}
                    title={title}
                    description={
                        request.kind === "menu"
                            ? "ورقة A4 كاملة للمدخل أو البوسترات."
                            : `${cards.length === 1 ? "كرت واحد" : `${cards.length} كروت`}، 2 بكل ورقة A4 (قصّها بالنص). من الطباعة فيك تختار «Save as PDF».`
                    }
                />
                {isTemporaryHost && (
                    <p role="alert" className="rounded-xl bg-warning/10 px-12 py-10 text-sm font-bold text-warning">
                        انتبه: الأكواد بتفتح على {siteUrl.host}، مش على دومين المطعم. للتجربة بس، لا تطبعها للطاولات.
                    </p>
                )}
                <div>
                    <PrintButton />
                </div>
            </div>

            <QrSheet
                cards={cards}
                restaurantName={restaurantConfig.name}
                colors={{ ink: background, accent }}
                layout={request.kind === "menu" ? "poster" : "cards"}
            />
        </div>
    );
};

export default QrPrintPage;
