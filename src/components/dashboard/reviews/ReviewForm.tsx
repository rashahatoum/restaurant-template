"use client";

import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import AppErrorAlert from "@/components/dashboard/feedback/AppErrorAlert";
import ErrorState from "@/components/dashboard/feedback/ErrorState";
import FieldShell, { describedBy } from "@/components/dashboard/form/FieldShell";
import HighlightInput from "@/components/dashboard/form/HighlightInput";
import { inputClasses, textareaClasses } from "@/components/dashboard/form/field-styles";
import SaveBar from "@/components/dashboard/form/SaveBar";
import Switch from "@/components/dashboard/Switch";
import ReviewCard from "@/components/reviews/ReviewCard";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useFormGuards } from "@/hooks/useFormGuards";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useSingleSubmit } from "@/hooks/useSingleSubmit";
import { fieldError, type AppError } from "@/lib/api/errors";
import { withNotice, type DoneAction } from "@/lib/dashboard/notice";
import { repository } from "@/lib/dashboard/repository";
import { isSameReviewForm, toReviewFormValues, toReviewInput, type ReviewFormValues } from "@/lib/dashboard/review-form";
import { REVIEW_LIMITS } from "@/lib/dashboard/validation";
import { toPlainText } from "@/lib/highlight";
import type { Review } from "@/types/content";
import type { DashboardData } from "@/types/dashboard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { FiTrash2, FiX } from "react-icons/fi";

interface ReviewFormProps {
    seed: DashboardData;
    /** The chat wallpaper behind the card (config, passed by the server page). */
    wallpaper?: string;
    /** Edit this review; without it the form adds a new one. */
    reviewId?: string;
}

const listUrl = (done: DoneAction, customerName: string) => withNotice("/dashboard/reviews", done, `رأي ${customerName}`);

// Waits for the browser draft before building the form (initial values are
// taken once). Same split as OfferForm / BannerForm.
const ReviewForm = ({ seed, wallpaper, reviewId }: ReviewFormProps) => {
    const data = useDashboardData(seed);
    const isHydrated = useIsHydrated();
    // Set just before deleting, so "not found" doesn't flash before the page changes
    const [isLeaving, setIsLeaving] = useState(false);

    if (!isHydrated || isLeaving) return <div aria-busy="true" className="min-h-480" />;

    const review = reviewId ? data.reviews.reviews.find((candidate) => candidate.id === reviewId) : undefined;
    if (reviewId && !review) {
        return (
            <ErrorState
                title="هالرأي مش موجود"
                message="يمكن انحذف، أو الرابط غلط."
                actions={
                    <Link href="/dashboard/reviews" className="inline-flex h-44 items-center rounded-full bg-primary px-20 font-extrabold text-background">
                        رجوع للآراء
                    </Link>
                }
            />
        );
    }

    return (
        <ReviewEditor
            key={reviewId ?? "new"}
            review={review}
            defaultQuestion={data.reviews.defaultQuestion}
            wallpaper={wallpaper}
            onLeave={setIsLeaving}
        />
    );
};

interface ReviewEditorProps {
    review?: Review;
    /** Shown when the review has no question of its own. */
    defaultQuestion: string;
    wallpaper?: string;
    onLeave: (isLeaving: boolean) => void;
}

// The form itself, with the WhatsApp-style card as the live preview.
const ReviewEditor = ({ review, defaultQuestion, wallpaper, onLeave }: ReviewEditorProps) => {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

    const [initial] = useState(() => toReviewFormValues(review));
    const [values, setValues] = useState(initial);
    const [error, setError] = useState<AppError>();
    const { isSaving, run } = useSingleSubmit();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const isDirty = !isSameReviewForm(values, initial);
    useFormGuards(formRef, error, isDirty);

    const set = <K extends keyof ReviewFormValues>(key: K, value: ReviewFormValues[K]) =>
        setValues((current) => ({ ...current, [key]: value }));
    const errorOf = (field: string) => fieldError(error, field);
    const input = toReviewInput(values, review);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = await run(() => (review ? repository.saveReview(review.id, input) : repository.createReview(input)));
        if (!result) return; // a second tap while saving
        if (!result.ok) return setError(result.error);
        router.push(listUrl(review ? "saved" : "added", result.data.customerName));
    };

    const remove = async () => {
        setIsConfirmingDelete(false);
        if (!review) return;
        onLeave(true);
        const result = await repository.deleteReview(review.id);
        if (!result.ok) {
            onLeave(false);
            return;
        }
        router.push(listUrl("deleted", review.customerName));
    };

    const nameError = errorOf("customerName");
    const questionError = errorOf("question");
    const answerError = errorOf("answer");
    const timeError = errorOf("time");

    return (
        <>
            <form ref={formRef} onSubmit={submit} noValidate className="grid gap-24 lg:grid-cols-[1fr_380px] lg:items-start">
                {/* Preview first on phones; on desktop it stays in sight beside the form */}
                <div className="flex flex-col gap-8 lg:sticky lg:top-96 lg:col-start-2 lg:row-start-1">
                    <p className="text-sm font-bold text-muted">هيك بيطلع بالرئيسية</p>
                    <div className="mx-auto flex w-full max-w-360 lg:min-h-320" aria-hidden="true">
                        <ReviewCard
                            customerName={input.customerName || "اسم الزبون"}
                            question={input.question ?? defaultQuestion}
                            answer={input.answer || "رد الزبون…"}
                            time={input.time}
                            wallpaper={wallpaper}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-18 lg:col-start-1 lg:row-start-1">
                    {error && <AppErrorAlert error={error} />}

                    <FieldShell
                        htmlFor="review-name"
                        label="اسم الزبون"
                        hint="الاسم الأول بس، لخصوصية الزبون."
                        error={nameError}
                        counter={`${values.customerName.length}/${REVIEW_LIMITS.customerName}`}
                    >
                        <input
                            id="review-name"
                            value={values.customerName}
                            onChange={(event) => set("customerName", event.target.value)}
                            maxLength={REVIEW_LIMITS.customerName}
                            placeholder="متل: سامر"
                            aria-invalid={Boolean(nameError)}
                            aria-describedby={describedBy("review-name", { hasHint: true, error: nameError })}
                            className={inputClasses}
                        />
                    </FieldShell>

                    <FieldShell
                        htmlFor="review-question"
                        label="سؤال المطعم (اختياري)"
                        hint="اتركه فاضي ليطلع سؤال القسم العام."
                        error={questionError}
                        counter={`${values.question.length}/${REVIEW_LIMITS.question}`}
                    >
                        <textarea
                            id="review-question"
                            value={values.question}
                            onChange={(event) => set("question", event.target.value)}
                            maxLength={REVIEW_LIMITS.question}
                            rows={2}
                            placeholder={defaultQuestion}
                            aria-invalid={Boolean(questionError)}
                            aria-describedby={describedBy("review-question", { hasHint: true, error: questionError })}
                            className={textareaClasses}
                        />
                    </FieldShell>

                    <FieldShell
                        htmlFor="review-answer"
                        label="رد الزبون"
                        hint="انسخه متل ما وصلك على واتساب. حدّد كلمات واكبس «ميّز» لتطلع بالبرتقالي."
                        error={answerError}
                        counter={`${toPlainText(values.answer).length}/${REVIEW_LIMITS.answer}`}
                    >
                        <HighlightInput
                            id="review-answer"
                            variant="text"
                            value={values.answer}
                            onChange={(answer) => set("answer", answer)}
                            maxLength={REVIEW_LIMITS.answer}
                            placeholder="متل: والله الشاورما عندكن ما في متلها 😍"
                            invalid={Boolean(answerError)}
                            describedBy={describedBy("review-answer", { hasHint: true, error: answerError })}
                        />
                    </FieldShell>

                    <FieldShell htmlFor="review-time" label="وقت الرد (اختياري)" hint="بيطلع تحت الرد متل واتساب." error={timeError}>
                        <div className="flex items-center gap-8">
                            <input
                                id="review-time"
                                type="time"
                                value={values.clock}
                                onChange={(event) => set("clock", event.target.value)}
                                dir="ltr"
                                aria-invalid={Boolean(timeError)}
                                aria-describedby={describedBy("review-time", { hasHint: true, error: timeError })}
                                className={`${inputClasses} max-w-200 text-center tabular-nums`}
                            />
                            {values.clock && (
                                <button
                                    type="button"
                                    onClick={() => set("clock", "")}
                                    className="inline-flex h-40 items-center gap-4 rounded-full px-10 text-xs font-bold text-muted transition-colors hover:text-danger"
                                >
                                    <FiX aria-hidden="true" />
                                    بلا وقت
                                </button>
                            )}
                        </div>
                    </FieldShell>

                    <div className="rounded-2xl border border-border bg-surface p-12">
                        <Switch checked={values.isVisible} onChange={(checked) => set("isVisible", checked)} label="ظاهر (بيطلع بالرئيسية)" />
                    </div>

                    {review && (
                        <button
                            type="button"
                            onClick={() => setIsConfirmingDelete(true)}
                            className="inline-flex h-40 items-center gap-6 self-start rounded-full border border-border px-14 text-sm font-bold text-muted transition-colors hover:border-danger hover:text-danger"
                        >
                            <FiTrash2 aria-hidden="true" />
                            حذف الرأي
                        </button>
                    )}

                    <SaveBar
                        isDirty={isDirty || !review}
                        isSaving={isSaving}
                        submitLabel={review ? "احفظ" : "أضف الرأي"}
                        onDiscard={() => {
                            setValues(initial);
                            setError(undefined);
                        }}
                    />
                </div>
            </form>

            <ConfirmDialog
                open={isConfirmingDelete}
                title={`حذف رأي ${review?.customerName ?? ""}؟`}
                message="رح ينشال نهائياً. إذا بدك تخبّيه لفترة بس، طفّي «ظاهر» بدل الحذف. ما فيك تتراجع عن هالخطوة."
                confirmLabel="إي، احذفه"
                onConfirm={remove}
                onCancel={() => setIsConfirmingDelete(false)}
            />
        </>
    );
};

export default ReviewForm;
