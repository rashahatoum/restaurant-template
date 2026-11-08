"use client";

import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import ToastViewport from "@/components/dashboard/feedback/ToastViewport";
import SectionTexts, { type SectionTextValues } from "@/components/dashboard/form/SectionTexts";
import ReorderList from "@/components/dashboard/ReorderList";
import Switch from "@/components/dashboard/Switch";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useDoneNotice } from "@/hooks/useDoneNotice";
import { useToast } from "@/hooks/useToast";
import type { DoneNotice } from "@/lib/dashboard/notice";
import { repository } from "@/lib/dashboard/repository";
import { REVIEW_LIMITS } from "@/lib/dashboard/validation";
import type { Review } from "@/types/content";
import type { DashboardData } from "@/types/dashboard";
import Link from "next/link";
import { useState } from "react";
import { FiInfo, FiPlus } from "react-icons/fi";
import ReviewRow from "./ReviewRow";

interface ReviewsEditorProps {
    seed: DashboardData;
    /** From ?done=&name=: what the review form just did, shown once as a toast. */
    notice?: DoneNotice;
}

// The reviews section (switch, texts, default question) and its reviews
// (shown or not, order). Same shape as the offers screen: every change goes
// through the repository and saves at once, except the texts (one button).
const ReviewsEditor = ({ seed, notice }: ReviewsEditorProps) => {
    const { reviews: section } = useDashboardData(seed);
    const { toast, show, hide } = useToast();
    const [toDelete, setToDelete] = useState<Review>();
    useDoneNotice(notice, show);

    const reviews = section.reviews;
    const visibleCount = reviews.filter((review) => review.isVisible).length;

    const toggleSection = async (isEnabled: boolean) => {
        const result = await repository.updateReviewsSettings({ isEnabled });
        show(
            result.ok
                ? {
                      tone: "success",
                      message: isEnabled ? "رجع قسم الآراء للرئيسية" : "انطفى قسم الآراء",
                      action: { label: "تراجع", onClick: () => toggleSection(!isEnabled) },
                  }
                : { tone: "error", message: result.error.message }
        );
    };

    const saveTexts = async ({ eyebrow, title, extra }: SectionTextValues) => {
        const result = await repository.updateReviewsSettings({ eyebrow, title, defaultQuestion: extra });
        if (result.ok) show({ tone: "success", message: "انحفظت النصوص" });
        return result;
    };

    const toggleReview = async (review: Review, isVisible: boolean) => {
        const result = await repository.setReviewVisible(review.id, isVisible);
        show(
            result.ok
                ? {
                      tone: "success",
                      message: `رأي ${review.customerName}: ${isVisible ? "ظاهر" : "مخفي"}`,
                      action: { label: "تراجع", onClick: () => toggleReview(review, !isVisible) },
                  }
                : { tone: "error", message: result.error.message }
        );
    };

    // The list itself shows the new order: a toast only when it fails (owner)
    const move = async (review: Review, direction: "up" | "down") => {
        const result = await repository.moveReview(review.id, direction);
        if (!result.ok) show({ tone: "error", message: result.error.message });
    };

    const remove = async () => {
        const review = toDelete;
        setToDelete(undefined);
        if (!review) return;
        const result = await repository.deleteReview(review.id);
        show(
            result.ok
                ? { tone: "success", message: `انحذف رأي ${review.customerName}` }
                : { tone: "error", message: result.error.message }
        );
    };

    // Why customers see nothing, when they don't (services/content hides the section)
    const hiddenReason = !section.isEnabled
        ? "القسم مطفي: الآراء مخفية من الرئيسية."
        : visibleCount === 0
          ? "ما في ولا رأي ظاهر، فالقسم مخفي عن الزبون."
          : undefined;

    return (
        <>
            {/* =========================
                SECTION
            ========================== */}

            <section aria-labelledby="reviews-section-heading" className="flex flex-col gap-16 rounded-2xl border border-border bg-surface p-16">
                <div className="flex flex-wrap items-center justify-between gap-10">
                    <h2 id="reviews-section-heading" className="text-lg font-extrabold">
                        قسم الآراء
                    </h2>
                    <Switch checked={section.isEnabled} onChange={toggleSection} label="ظاهر بالرئيسية" />
                </div>

                {hiddenReason && (
                    <p className="flex items-start gap-8 rounded-xl bg-background px-12 py-10 text-sm text-muted">
                        <FiInfo aria-hidden="true" className="mt-3 shrink-0 text-muted" />
                        {hiddenReason}
                    </p>
                )}

                <SectionTexts
                    // Fresh values after a save or a reset
                    key={`${section.eyebrow}|${section.title}|${section.defaultQuestion}`}
                    idPrefix="reviews"
                    eyebrow={section.eyebrow}
                    title={section.title}
                    placeholders={{ eyebrow: "متل: وصلتنا على واتساب", title: "متل: شو قالوا عنّا" }}
                    extra={{
                        field: "defaultQuestion",
                        label: "سؤال المطعم",
                        value: section.defaultQuestion,
                        maxLength: REVIEW_LIMITS.question,
                        placeholder: "متل: أهلين 🌹 كيف كانت تجربتك معنا اليوم؟",
                        hint: "رسالة المطعم اللي بتطلع فوق رد الزبون، إلا إذا كتبت سؤال خاص لرأي معيّن.",
                    }}
                    onSave={saveTexts}
                />
            </section>

            {/* =========================
                REVIEWS (slider order)
            ========================== */}

            <div className="flex items-center justify-between gap-12">
                <p className="text-sm text-muted">بنفس هالترتيب بتطلع بسلايدر الرئيسية. اكبس على الاسم لتعدّل الرأي.</p>
                <Link
                    href="/dashboard/reviews/new"
                    className="inline-flex h-40 shrink-0 items-center gap-6 rounded-full bg-primary px-16 text-sm font-extrabold text-background transition-opacity hover:opacity-90"
                >
                    <FiPlus aria-hidden="true" />
                    رأي جديد
                </Link>
            </div>

            {reviews.length > 0 ? (
                // Faded while the whole section is off: none of these reach customers
                <ReorderList className={`flex flex-col gap-10 transition-opacity ${section.isEnabled ? "" : "opacity-50"}`}>
                    {reviews.map((review, index) => (
                        <li key={review.id} data-flip-id={review.id}>
                            <ReviewRow
                                review={review}
                                index={index}
                                total={reviews.length}
                                onToggle={(isVisible) => toggleReview(review, isVisible)}
                                onMove={(direction) => move(review, direction)}
                                onDelete={() => setToDelete(review)}
                            />
                        </li>
                    ))}
                </ReorderList>
            ) : (
                <p className="rounded-2xl border border-dashed border-border px-16 py-40 text-center text-muted">
                    ما في آراء لسا. انسخ أول رأي وصلك على واتساب.
                </p>
            )}

            <ConfirmDialog
                open={Boolean(toDelete)}
                title={`حذف رأي ${toDelete?.customerName ?? ""}؟`}
                message="رح ينشال نهائياً. إذا بدك تخبّيه لفترة بس، طفّي «ظاهر» بدل الحذف. ما فيك تتراجع عن هالخطوة."
                confirmLabel="إي، احذفه"
                onConfirm={remove}
                onCancel={() => setToDelete(undefined)}
            />

            <ToastViewport toast={toast} onClose={hide} />
        </>
    );
};

export default ReviewsEditor;
