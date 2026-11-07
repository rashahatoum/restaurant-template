"use client";

import MenuBannerSlide from "@/components/menu/MenuBannerSlide";
import { useImageSrc } from "@/hooks/useImageSrc";
import type { MenuBannerSlideData } from "@/types/content";
import type { MouseEvent } from "react";

interface BannerPreviewProps {
    slide: MenuBannerSlideData;
    /** The brand texture behind every slide (from config, passed by the server page). */
    background: string;
}

/** Links inside the preview point at the public site: keep the owner on the form. */
const stayOnForm = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("a")) event.preventDefault();
};

// The slide as customers will see it at the top of the menu, with the site's
// own MenuBannerSlide, updated as the owner types.
const BannerPreview = ({ slide, background }: BannerPreviewProps) => {
    // A photo added on this device is an IndexedDB reference: get its object URL
    const src = useImageSrc(slide.image.src || undefined);

    return (
        <section aria-label="معاينة" className="flex flex-col gap-10">
            <h2 className="text-sm font-bold text-muted">معاينة: هيك رح تطلع بأول المنيو</h2>
            <div onClickCapture={stayOnForm} className="rounded-3xl border border-dashed border-border p-10">
                {src ? (
                    <MenuBannerSlide
                        eyebrow={slide.eyebrow}
                        title={slide.title}
                        image={{ src, alt: slide.image.alt }}
                        background={background}
                        action={slide.action}
                    />
                ) : (
                    <p className="rounded-2xl border border-dashed border-border px-16 py-48 text-center text-sm text-muted">
                        ضيف صورة الطبق لتشوف الشريحة.
                    </p>
                )}
            </div>
        </section>
    );
};

export default BannerPreview;
