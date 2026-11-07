"use client";

import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import AppErrorAlert from "@/components/dashboard/feedback/AppErrorAlert";
import ErrorState from "@/components/dashboard/feedback/ErrorState";
import FieldError from "@/components/dashboard/feedback/FieldError";
import ChipsInput from "@/components/dashboard/form/ChipsInput";
import FieldShell, { describedBy } from "@/components/dashboard/form/FieldShell";
import ImagePicker from "@/components/dashboard/form/ImagePicker";
import { inputClasses } from "@/components/dashboard/form/field-styles";
import SaveBar from "@/components/dashboard/form/SaveBar";
import Switch from "@/components/dashboard/Switch";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useFormGuards } from "@/hooks/useFormGuards";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useSingleSubmit } from "@/hooks/useSingleSubmit";
import { fieldError, type AppError } from "@/lib/api/errors";
import { withNotice, type DoneAction } from "@/lib/dashboard/notice";
import { isSameOfferForm, parseOfferForm, previewOffer, toOfferFormValues, type OfferFormValues } from "@/lib/dashboard/offer-form";
import { repository } from "@/lib/dashboard/repository";
import { OFFER_LIMITS } from "@/lib/dashboard/validation";
import type { Offer } from "@/types/content";
import type { DashboardData } from "@/types/dashboard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { FiTrash2 } from "react-icons/fi";
import OfferPreview from "./OfferPreview";

interface OfferFormProps {
    seed: DashboardData;
    /** Edit this offer; without it the form adds a new one. */
    offerId?: string;
}

const listUrl = (done: DoneAction, name: string) => withNotice("/dashboard/offers", done, name);

// Waits for the browser draft before building the form (initial values are
// taken once, so they must come from the draft, not the server seed). Same
// split as ProductForm.
const OfferForm = ({ seed, offerId }: OfferFormProps) => {
    const data = useDashboardData(seed);
    const isHydrated = useIsHydrated();
    // Set just before deleting, so "not found" doesn't flash before the page changes
    const [isLeaving, setIsLeaving] = useState(false);

    if (!isHydrated || isLeaving) return <div aria-busy="true" className="min-h-480" />;

    const offer = offerId ? data.offers.offers.find((candidate) => candidate.id === offerId) : undefined;
    if (offerId && !offer) {
        return (
            <ErrorState
                title="هالعرض مش موجود"
                message="يمكن انحذف، أو الرابط غلط."
                actions={
                    <Link href="/dashboard/offers" className="inline-flex h-44 items-center rounded-full bg-primary px-20 font-extrabold text-background">
                        رجوع للعروض
                    </Link>
                }
            />
        );
    }

    return <OfferEditor key={offerId ?? "new"} offer={offer} onLeave={setIsLeaving} />;
};

interface OfferEditorProps {
    offer?: Offer;
    /** true just before deleting (the parent shows a placeholder); false if it failed. */
    onLeave: (isLeaving: boolean) => void;
}

// The form itself, with a live preview of the card and the menu row.
const OfferEditor = ({ offer, onLeave }: OfferEditorProps) => {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

    const [initial] = useState(() => toOfferFormValues(offer));
    const [values, setValues] = useState(initial);
    const [error, setError] = useState<AppError>();
    const { isSaving, run } = useSingleSubmit();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const isDirty = !isSameOfferForm(values, initial);
    useFormGuards(formRef, error, isDirty);

    const set = <K extends keyof OfferFormValues>(key: K, value: OfferFormValues[K]) =>
        setValues((current) => ({ ...current, [key]: value }));
    const errorOf = (field: string) => fieldError(error, field);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsed = parseOfferForm(values);
        if (!parsed.ok) return setError(parsed.error);

        const input = parsed.data;
        const result = await run(() => (offer ? repository.saveOffer(offer.id, input) : repository.createOffer(input)));
        if (!result) return; // a second tap while saving
        if (!result.ok) return setError(result.error);
        router.push(listUrl(offer ? "saved" : "added", result.data.title));
    };

    const remove = async () => {
        setIsConfirmingDelete(false);
        if (!offer) return;
        onLeave(true);
        const result = await repository.deleteOffer(offer.id);
        if (!result.ok) {
            // Rare (already gone): the form comes back, remounted
            onLeave(false);
            return;
        }
        router.push(listUrl("deleted", offer.title));
    };

    const titleError = errorOf("title");
    const itemsError = errorOf("items");
    const freeItemError = errorOf("freeItem");
    const priceError = errorOf("price");
    const badgeError = errorOf("badge");
    const imageError = errorOf("image");

    return (
        <>
            <form ref={formRef} onSubmit={submit} noValidate className="grid gap-24 lg:grid-cols-[1fr_400px] lg:items-start">
                {/* Preview first on phones; on desktop it stays in sight beside the form */}
                <div className="lg:sticky lg:top-96 lg:col-start-2 lg:row-start-1">
                    <OfferPreview offer={previewOffer(values, offer?.id ?? "preview")} />
                </div>

                <div className="flex flex-col gap-18 lg:col-start-1 lg:row-start-1">
                    {error && <AppErrorAlert error={error} />}

                    <FieldShell htmlFor="offer-title" label="اسم العرض" error={titleError} counter={`${values.title.length}/${OFFER_LIMITS.title}`}>
                        <input
                            id="offer-title"
                            value={values.title}
                            onChange={(event) => set("title", event.target.value)}
                            maxLength={OFFER_LIMITS.title}
                            placeholder="متل: عرض 4+1"
                            aria-invalid={Boolean(titleError)}
                            aria-describedby={describedBy("offer-title", { error: titleError })}
                            className={inputClasses}
                        />
                    </FieldShell>

                    <FieldShell
                        htmlFor="offer-items"
                        label="شو بياخد الزبون"
                        error={itemsError}
                        counter={`${values.items.length}/${OFFER_LIMITS.items}`}
                        hint="اكتب كل شي لحال واكبس Enter أو فاصلة."
                    >
                        <ChipsInput
                            id="offer-items"
                            values={values.items}
                            onChange={(next) => set("items", next)}
                            max={OFFER_LIMITS.items}
                            maxLength={OFFER_LIMITS.item}
                            placeholder="متل: 4 سندويشات شاورما جاج"
                            invalid={Boolean(itemsError)}
                            describedBy={describedBy("offer-items", { hasHint: true, error: itemsError })}
                        />
                    </FieldShell>

                    <div className="grid gap-18 md:grid-cols-2">
                        <FieldShell
                            htmlFor="offer-free-item"
                            label="الهدية (مجاناً)"
                            error={freeItemError}
                            counter={`${values.freeItem.length}/${OFFER_LIMITS.freeItem}`}
                        >
                            <input
                                id="offer-free-item"
                                value={values.freeItem}
                                onChange={(event) => set("freeItem", event.target.value)}
                                maxLength={OFFER_LIMITS.freeItem}
                                placeholder="متل: لتر ببسي"
                                aria-invalid={Boolean(freeItemError)}
                                aria-describedby={describedBy("offer-free-item", { error: freeItemError })}
                                className={inputClasses}
                            />
                        </FieldShell>

                        <FieldShell htmlFor="offer-price" label="سعر العرض (ل.س)" error={priceError}>
                            <input
                                id="offer-price"
                                value={values.price}
                                onChange={(event) => set("price", event.target.value)}
                                inputMode="numeric"
                                dir="ltr"
                                placeholder="1000"
                                aria-invalid={Boolean(priceError)}
                                aria-describedby={describedBy("offer-price", { error: priceError })}
                                className={`${inputClasses} text-end tabular-nums`}
                            />
                        </FieldShell>
                    </div>

                    <div className="flex flex-col gap-6">
                        <ImagePicker
                            id="offer-image"
                            label="صورة العرض"
                            hint="عريضة شوي (4:3). الأحسن صحن مقصوص على خلفية شفافة (PNG أو WebP)، أو صورة كاملة بتطلع بزوايا مدوّرة. بنصغّرها لحالنا."
                            value={values.image}
                            imageStyle={values.imageStyle}
                            // The picker detects cut-out vs full photo by itself; no choice shown
                            onChange={({ image, imageStyle }) => setValues((current) => ({ ...current, image, imageStyle }))}
                        />
                        {/* The picker's own errors are about the file; this one is "required" */}
                        <FieldError id="offer-image-required" message={imageError} />
                    </div>

                    <FieldShell
                        htmlFor="offer-badge"
                        label="شارة (اختياري)"
                        hint="كلمة صغيرة فوق الكرت، متل «الأكثر طلباً». اتركها فاضية إذا ما بدك."
                        error={badgeError}
                        counter={`${values.badge.length}/${OFFER_LIMITS.badge}`}
                    >
                        <input
                            id="offer-badge"
                            value={values.badge}
                            onChange={(event) => set("badge", event.target.value)}
                            maxLength={OFFER_LIMITS.badge}
                            placeholder="متل: الأكثر طلباً"
                            aria-invalid={Boolean(badgeError)}
                            aria-describedby={describedBy("offer-badge", { hasHint: true, error: badgeError })}
                            className={inputClasses}
                        />
                    </FieldShell>

                    <div className="rounded-2xl border border-border bg-surface p-12">
                        <Switch checked={values.isActive} onChange={(checked) => set("isActive", checked)} label="فعّال (بيطلع للزبون)" />
                    </div>

                    {offer && (
                        <button
                            type="button"
                            onClick={() => setIsConfirmingDelete(true)}
                            className="inline-flex h-40 items-center gap-6 self-start rounded-full border border-border px-14 text-sm font-bold text-muted transition-colors hover:border-danger hover:text-danger"
                        >
                            <FiTrash2 aria-hidden="true" />
                            حذف العرض
                        </button>
                    )}

                    <SaveBar
                        isDirty={isDirty || !offer}
                        isSaving={isSaving}
                        submitLabel={offer ? "احفظ" : "أضف العرض"}
                        onDiscard={() => {
                            setValues(initial);
                            setError(undefined);
                        }}
                    />
                </div>
            </form>

            <ConfirmDialog
                open={isConfirmingDelete}
                title={`حذف ${offer?.title ?? "العرض"}؟`}
                message="رح ينشال من الرئيسية والمنيو. إذا بدك توقفه لفترة بس، طفّي «فعّال» بدل الحذف. ما فيك تتراجع عن هالخطوة."
                confirmLabel="إي، احذفه"
                onConfirm={remove}
                onCancel={() => setIsConfirmingDelete(false)}
            />
        </>
    );
};

export default OfferForm;
