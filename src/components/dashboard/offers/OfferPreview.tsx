"use client";

import MenuItemRow from "@/components/menu/MenuItemRow";
import OfferCard from "@/components/menu/OfferCard";
import { useImageSrc } from "@/hooks/useImageSrc";
import { offerKey } from "@/lib/cart";
import type { Offer } from "@/types/content";
import { useState, type MouseEvent } from "react";

type PreviewTab = "card" | "row";

const TABS: { id: PreviewTab; label: string }[] = [
    { id: "card", label: "بالرئيسية" },
    { id: "row", label: "بالمنيو" },
];

/** Links inside the preview point at the public site: keep the owner on the form. */
const stayOnForm = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("a")) event.preventDefault();
};

// The offer as customers will see it, with the site's own components (the
// home card and the menu row), updated as the owner types. Same idea as
// ProductPreview: the cart is never touched and links don't navigate.
const OfferPreview = ({ offer }: { offer: Offer }) => {
    const [tab, setTab] = useState<PreviewTab>("card");
    // A photo added on this device is an IndexedDB reference: get its object URL
    const image = useImageSrc(offer.image || undefined);

    return (
        <section aria-label="معاينة" className="flex flex-col gap-10">
            <div className="flex items-center justify-between gap-8">
                <h2 className="text-sm font-bold text-muted">معاينة: هيك رح يشوفه الزبون</h2>
                <div className="flex rounded-full border border-border bg-background p-3">
                    {TABS.map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            aria-pressed={tab === id}
                            onClick={() => setTab(id)}
                            className="h-30 rounded-full px-12 text-xs font-bold text-muted transition-colors aria-pressed:bg-primary aria-pressed:text-background"
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div onClickCapture={stayOnForm} className="rounded-3xl border border-dashed border-border p-10">
                {tab === "card" ? (
                    // Room above for the photo and the sticker that rise out of the card
                    <div className="mx-auto max-w-320 pt-20">
                        {image ? (
                            <OfferCard
                                title={offer.title}
                                items={offer.items}
                                freeItem={offer.freeItem}
                                price={offer.price}
                                image={image}
                                imageStyle={offer.imageStyle}
                                badge={offer.badge}
                                href="/menu"
                                detailsHref={`/menu/${offer.id}`}
                            />
                        ) : (
                            <p className="rounded-2xl border border-dashed border-border px-16 py-48 text-center text-sm text-muted">
                                ضيف صورة العرض لتشوف الكرت.
                            </p>
                        )}
                    </div>
                ) : (
                    <MenuItemRow
                        id={`preview-${offer.id}`}
                        itemKey={offerKey(offer.id)}
                        href={`/menu/${offer.id}`}
                        name={offer.title}
                        details={offer.items}
                        freeItem={offer.freeItem}
                        image={image}
                        imageStyle={offer.imageStyle}
                        price={offer.price}
                        badge={offer.badge}
                        isAvailable
                        preview
                    />
                )}
            </div>
        </section>
    );
};

export default OfferPreview;
