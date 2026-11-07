"use client";

import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import ToastViewport from "@/components/dashboard/feedback/ToastViewport";
import ReorderList from "@/components/dashboard/ReorderList";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDoneNotice } from "@/hooks/useDoneNotice";
import { useToast } from "@/hooks/useToast";
import { describeTarget } from "@/lib/dashboard/banner-form";
import type { DoneNotice } from "@/lib/dashboard/notice";
import { repository } from "@/lib/dashboard/repository";
import type { MenuBanner } from "@/types/content";
import type { DashboardData } from "@/types/dashboard";
import Link from "next/link";
import { useState } from "react";
import { FiInfo, FiPlus } from "react-icons/fi";
import BannerRow from "./BannerRow";

interface BannerEditorProps {
    seed: DashboardData;
    /** From ?done=&name=: what the slide form just did, shown once as a toast. */
    notice?: DoneNotice;
}

/** The slide's name in toasts and dialogs (titles keep their line break). */
const slideName = (banner: MenuBanner) => banner.title.replace(/\n/g, " ");

// The menu banner's slides: on/off, order, delete. Client because the data
// lives in the browser draft; every change goes through the repository.
const BannerEditor = ({ seed, notice }: BannerEditorProps) => {
    const data = useDashboardData(seed);
    const { toast, show, hide } = useToast();
    const [toDelete, setToDelete] = useState<MenuBanner>();
    useDoneNotice(notice, show);

    const banners = data.banners;
    const activeCount = banners.filter((banner) => banner.isActive).length;

    const toggle = async (banner: MenuBanner, isActive: boolean) => {
        const result = await repository.setBannerActive(banner.id, isActive);
        show(
            result.ok
                ? {
                      tone: "success",
                      message: `${slideName(banner)}: ${isActive ? "فعّالة" : "موقّفة"}`,
                      action: { label: "تراجع", onClick: () => toggle(banner, !isActive) },
                  }
                : { tone: "error", message: result.error.message }
        );
    };

    // The list shows the new order: a toast only when it fails (owner)
    const move = async (banner: MenuBanner, direction: "up" | "down") => {
        const result = await repository.moveBanner(banner.id, direction);
        if (!result.ok) show({ tone: "error", message: result.error.message });
    };

    const remove = async () => {
        const banner = toDelete;
        setToDelete(undefined);
        if (!banner) return;
        const result = await repository.deleteBanner(banner.id);
        show(result.ok ? { tone: "success", message: `انحذفت ${slideName(banner)}` } : { tone: "error", message: result.error.message });
    };

    return (
        <>
            <div className="flex items-center justify-between gap-12">
                <p className="text-sm text-muted">بنفس هالترتيب بتتقلّب بأول المنيو. اكبس على العنوان لتعدّل الشريحة.</p>
                <Link
                    href="/dashboard/banner/new"
                    className="inline-flex h-40 shrink-0 items-center gap-6 rounded-full bg-primary px-16 text-sm font-extrabold text-background transition-opacity hover:opacity-90"
                >
                    <FiPlus aria-hidden="true" />
                    شريحة جديدة
                </Link>
            </div>

            {banners.length > 0 && activeCount === 0 && (
                <p className="flex items-start gap-8 rounded-xl border border-border bg-surface px-12 py-10 text-sm text-muted">
                    <FiInfo aria-hidden="true" className="mt-3 shrink-0 text-primary" />
                    ما في ولا شريحة فعّالة، فالبانر مخفي من المنيو.
                </p>
            )}

            {banners.length > 0 ? (
                <ReorderList className="flex flex-col gap-10">
                    {banners.map((banner, index) => (
                        <li key={banner.id} data-flip-id={banner.id}>
                            <BannerRow
                                banner={banner}
                                target={banner.action && describeTarget(banner.action.target, data)}
                                index={index}
                                total={banners.length}
                                onToggle={(isActive) => toggle(banner, isActive)}
                                onMove={(direction) => move(banner, direction)}
                                onDelete={() => setToDelete(banner)}
                            />
                        </li>
                    ))}
                </ReorderList>
            ) : (
                <p className="rounded-2xl border border-dashed border-border px-16 py-40 text-center text-muted">
                    ما في شرائح. ضيف أول شريحة، وبيطلع البانر بأول المنيو.
                </p>
            )}

            <ConfirmDialog
                open={Boolean(toDelete)}
                title={`حذف «${toDelete ? slideName(toDelete) : ""}»؟`}
                message="رح تنشال نهائياً من بانر المنيو. إذا بدك توقفها لفترة بس، طفّي «فعّالة» بدل الحذف. ما فيك تتراجع عن هالخطوة."
                confirmLabel="إي، احذفها"
                onConfirm={remove}
                onCancel={() => setToDelete(undefined)}
            />

            <ToastViewport toast={toast} onClose={hide} />
        </>
    );
};

export default BannerEditor;
