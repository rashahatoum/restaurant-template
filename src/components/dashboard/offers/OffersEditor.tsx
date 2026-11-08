"use client";

import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import ToastViewport from "@/components/dashboard/feedback/ToastViewport";
import ReorderList from "@/components/dashboard/ReorderList";
import ImagePicker from "@/components/dashboard/form/ImagePicker";
import Switch from "@/components/dashboard/Switch";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDoneNotice } from "@/hooks/useDoneNotice";
import { useToast } from "@/hooks/useToast";
import type { DoneNotice } from "@/lib/dashboard/notice";
import { repository } from "@/lib/dashboard/repository";
import type { Offer } from "@/types/content";
import type { DashboardData } from "@/types/dashboard";
import Link from "next/link";
import { useState } from "react";
import { FiInfo, FiPlus } from "react-icons/fi";
import SectionTexts, { type SectionTextValues } from "@/components/dashboard/form/SectionTexts";
import OfferRow from "./OfferRow";

interface OffersEditorProps {
    seed: DashboardData;
    /** From ?done=&name=: what the offer form just did, shown once as a toast. */
    notice?: DoneNotice;
}

// The offers section (switch, titles, menu card photo) and its offers (on/off,
// order). Client because the data lives in the browser draft; every change
// goes through the repository and saves at once, except the titles (one button).
const OffersEditor = ({ seed, notice }: OffersEditorProps) => {
    const { offers: section } = useDashboardData(seed);
    const { toast, show, hide } = useToast();
    const [toDelete, setToDelete] = useState<Offer>();
    useDoneNotice(notice, show);

    const offers = section.offers;
    const activeCount = offers.filter((offer) => offer.isActive).length;

    const toggleSection = async (isEnabled: boolean) => {
        const result = await repository.updateOffersSettings({ isEnabled });
        show(
            result.ok
                ? {
                      tone: "success",
                      message: isEnabled ? "رجع قسم العروض للرئيسية والمنيو" : "انطفى قسم العروض",
                      action: { label: "تراجع", onClick: () => toggleSection(!isEnabled) },
                  }
                : { tone: "error", message: result.error.message }
        );
    };

    const changeCardImage = async (menuCardImage: string | undefined) => {
        const result = await repository.updateOffersSettings({ menuCardImage });
        show(
            result.ok
                ? { tone: "success", message: menuCardImage ? "تغيّرت صورة كرت العروض" : "انشالت الصورة، بتطلع صورة أول عرض مكانها" }
                : { tone: "error", message: result.error.message }
        );
    };

    const saveTexts = async ({ eyebrow, title }: SectionTextValues) => {
        const result = await repository.updateOffersSettings({ eyebrow, title });
        if (result.ok) show({ tone: "success", message: "انحفظت العناوين" });
        return result;
    };

    const toggleOffer = async (offer: Offer, isActive: boolean) => {
        const result = await repository.setOfferActive(offer.id, isActive);
        show(
            result.ok
                ? {
                      tone: "success",
                      message: `${offer.title}: ${isActive ? "فعّال" : "موقّف"}`,
                      action: { label: "تراجع", onClick: () => toggleOffer(offer, !isActive) },
                  }
                : { tone: "error", message: result.error.message }
        );
    };

    // The list itself shows the new order: a toast only when it fails (owner)
    const move = async (offer: Offer, direction: "up" | "down") => {
        const result = await repository.moveOffer(offer.id, direction);
        if (!result.ok) show({ tone: "error", message: result.error.message });
    };

    const remove = async () => {
        const offer = toDelete;
        setToDelete(undefined);
        if (!offer) return;
        const result = await repository.deleteOffer(offer.id);
        show(result.ok ? { tone: "success", message: `انحذف ${offer.title}` } : { tone: "error", message: result.error.message });
    };

    // Why customers see nothing, when they don't (services/content hides the section)
    const hiddenReason = !section.isEnabled
        ? "القسم مطفي: العروض مخفية من الرئيسية والمنيو."
        : activeCount === 0
          ? "ما في ولا عرض فعّال، فالقسم مخفي عن الزبون."
          : undefined;

    return (
        <>
            {/* =========================
                SECTION
            ========================== */}

            <section aria-labelledby="offers-section-heading" className="flex flex-col gap-16 rounded-2xl border border-border bg-surface p-16">
                <div className="flex flex-wrap items-center justify-between gap-10">
                    <h2 id="offers-section-heading" className="text-lg font-extrabold">
                        قسم العروض
                    </h2>
                    <Switch checked={section.isEnabled} onChange={toggleSection} label="ظاهر بالرئيسية والمنيو" />
                </div>

                {hiddenReason && (
                    <p className="flex items-start gap-8 rounded-xl bg-background px-12 py-10 text-sm text-muted">
                        <FiInfo aria-hidden="true" className="mt-3 shrink-0 text-primary" />
                        {hiddenReason}
                    </p>
                )}

                <SectionTexts
                    // Fresh values after a save or a reset
                    key={`${section.eyebrow}|${section.title}`}
                    idPrefix="offers"
                    eyebrow={section.eyebrow}
                    title={section.title}
                    placeholders={{ eyebrow: "متل: عروض أهل الكرم", title: "متل: الكرم بالعروض" }}
                    onSave={saveTexts}
                />

                <ImagePicker
                    id="offers-card-image"
                    label="صورة كرت «العروض» بالمنيو"
                    hint="صورة كاملة، بتنقص مربعة. بدونها بتطلع صورة أول عرض."
                    value={section.menuCardImage}
                    onChange={({ image }) => changeCardImage(image)}
                    compact
                    fullPhoto
                />
            </section>

            {/* =========================
                OFFERS (slider order)
            ========================== */}

            <div className="flex items-center justify-between gap-12">
                <p className="text-sm text-muted">بنفس هالترتيب بتطلع بالرئيسية والمنيو. اكبس على اسم العرض لتعدّله.</p>
                <Link
                    href="/dashboard/offers/new"
                    className="inline-flex h-40 shrink-0 items-center gap-6 rounded-full bg-primary px-16 text-sm font-extrabold text-background transition-opacity hover:opacity-90"
                >
                    <FiPlus aria-hidden="true" />
                    عرض جديد
                </Link>
            </div>

            {offers.length > 0 ? (
                // Faded while the whole section is off: none of these reach customers
                <ReorderList className={`flex flex-col gap-10 transition-opacity ${section.isEnabled ? "" : "opacity-50"}`}>
                    {offers.map((offer, index) => (
                        <li key={offer.id} data-flip-id={offer.id}>
                            <OfferRow
                                offer={offer}
                                index={index}
                                total={offers.length}
                                onToggle={(isActive) => toggleOffer(offer, isActive)}
                                onMove={(direction) => move(offer, direction)}
                                onDelete={() => setToDelete(offer)}
                            />
                        </li>
                    ))}
                </ReorderList>
            ) : (
                <p className="rounded-2xl border border-dashed border-border px-16 py-40 text-center text-muted">
                    ما في عروض لسا. ضيف أول عرض.
                </p>
            )}

            <ConfirmDialog
                open={Boolean(toDelete)}
                title={`حذف ${toDelete?.title ?? "العرض"}؟`}
                message="رح ينشال نهائياً من الرئيسية والمنيو. إذا بدك توقفه لفترة بس، طفّي «فعّال» بدل الحذف. ما فيك تتراجع عن هالخطوة."
                confirmLabel="إي، احذفه"
                onConfirm={remove}
                onCancel={() => setToDelete(undefined)}
            />

            <ToastViewport toast={toast} onClose={hide} />
        </>
    );
};

export default OffersEditor;
