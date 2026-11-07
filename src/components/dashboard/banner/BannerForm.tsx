"use client";

import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import AppErrorAlert from "@/components/dashboard/feedback/AppErrorAlert";
import ErrorState from "@/components/dashboard/feedback/ErrorState";
import FieldError from "@/components/dashboard/feedback/FieldError";
import FieldShell, { describedBy } from "@/components/dashboard/form/FieldShell";
import ImagePicker from "@/components/dashboard/form/ImagePicker";
import { inputClasses, textareaClasses } from "@/components/dashboard/form/field-styles";
import SaveBar from "@/components/dashboard/form/SaveBar";
import Switch from "@/components/dashboard/Switch";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useFormGuards } from "@/hooks/useFormGuards";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useSingleSubmit } from "@/hooks/useSingleSubmit";
import { fieldError, type AppError } from "@/lib/api/errors";
import {
    bannerTargetsFromData,
    describeTarget,
    isSameBannerForm,
    previewBanner,
    toBannerFormValues,
    toBannerInput,
    type BannerFormValues,
} from "@/lib/dashboard/banner-form";
import { withNotice, type DoneAction } from "@/lib/dashboard/notice";
import { repository } from "@/lib/dashboard/repository";
import { BANNER_LIMITS } from "@/lib/dashboard/validation";
import type { MenuBanner } from "@/types/content";
import type { DashboardData } from "@/types/dashboard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { FiTrash2 } from "react-icons/fi";
import BannerPreview from "./BannerPreview";
import BannerTargetFields from "./BannerTargetFields";

interface BannerFormProps {
    seed: DashboardData;
    /** The brand texture behind slides (config, passed by the server page). */
    background: string;
    /** Edit this slide; without it the form adds a new one. */
    bannerId?: string;
}

const listUrl = (done: DoneAction, title: string) => withNotice("/dashboard/banner", done, title.replace(/\n/g, " "));

// Waits for the browser draft before building the form (initial values are
// taken once). Same split as ProductForm / OfferForm.
const BannerForm = ({ seed, background, bannerId }: BannerFormProps) => {
    const data = useDashboardData(seed);
    const isHydrated = useIsHydrated();
    // Set just before deleting, so "not found" doesn't flash before the page changes
    const [isLeaving, setIsLeaving] = useState(false);

    if (!isHydrated || isLeaving) return <div aria-busy="true" className="min-h-480" />;

    const banner = bannerId ? data.banners.find((candidate) => candidate.id === bannerId) : undefined;
    if (bannerId && !banner) {
        return (
            <ErrorState
                title="هالشريحة مش موجودة"
                message="يمكن انحذفت، أو الرابط غلط."
                actions={
                    <Link href="/dashboard/banner" className="inline-flex h-44 items-center rounded-full bg-primary px-20 font-extrabold text-background">
                        رجوع للبانر
                    </Link>
                }
            />
        );
    }

    return <BannerEditorForm key={bannerId ?? "new"} banner={banner} data={data} background={background} onLeave={setIsLeaving} />;
};

interface BannerEditorFormProps {
    banner?: MenuBanner;
    /** Categories and products for the button's target, and what customers can reach. */
    data: DashboardData;
    background: string;
    onLeave: (isLeaving: boolean) => void;
}

const BannerEditorForm = ({ banner, data, background, onLeave }: BannerEditorFormProps) => {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

    const [initial] = useState(() =>
        toBannerFormValues(banner, { categoryId: data.categories[0]?.id ?? "", productId: data.products[0]?.id ?? "" })
    );
    const [values, setValues] = useState(initial);
    const [error, setError] = useState<AppError>();
    const { isSaving, run } = useSingleSubmit();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const isDirty = !isSameBannerForm(values, initial);
    useFormGuards(formRef, error, isDirty);

    const set = <K extends keyof BannerFormValues>(key: K, value: BannerFormValues[K]) =>
        setValues((current) => ({ ...current, [key]: value }));
    const errorOf = (field: string) => fieldError(error, field);

    const input = toBannerInput(values);
    const target = input.action && describeTarget(input.action.target, data);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = await run(() => (banner ? repository.saveBanner(banner.id, input) : repository.createBanner(input)));
        if (!result) return; // a second tap while saving
        if (!result.ok) return setError(result.error);
        router.push(listUrl(banner ? "saved" : "added", result.data.title));
    };

    const remove = async () => {
        setIsConfirmingDelete(false);
        if (!banner) return;
        onLeave(true);
        const result = await repository.deleteBanner(banner.id);
        if (!result.ok) {
            onLeave(false);
            return;
        }
        router.push(listUrl("deleted", banner.title));
    };

    const eyebrowError = errorOf("eyebrow");
    const titleError = errorOf("title");
    const imageError = errorOf("image");
    const labelError = errorOf("action.label");
    const titleLines = values.title.split("\n");

    return (
        <>
            {/* The slide is wide on the menu: its preview takes the full width above
                the form (a side column would squeeze it into a phone-sized box) */}
            <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-24">
                <BannerPreview slide={previewBanner(values, banner?.id ?? "preview", data)} background={background} />

                <div className="flex w-full max-w-720 flex-col gap-18">
                    {error && <AppErrorAlert error={error} />}

                    <FieldShell
                        htmlFor="banner-eyebrow"
                        label="العنوان الصغير (اختياري)"
                        error={eyebrowError}
                        counter={`${values.eyebrow.length}/${BANNER_LIMITS.eyebrow}`}
                    >
                        <input
                            id="banner-eyebrow"
                            value={values.eyebrow}
                            onChange={(event) => set("eyebrow", event.target.value)}
                            maxLength={BANNER_LIMITS.eyebrow}
                            placeholder="متل: عرض الأسبوع"
                            aria-invalid={Boolean(eyebrowError)}
                            aria-describedby={describedBy("banner-eyebrow", { error: eyebrowError })}
                            className={inputClasses}
                        />
                    </FieldShell>

                    <FieldShell
                        htmlFor="banner-title"
                        label="العنوان"
                        hint="سطرين بالكتير. اكبس Enter لتنزل سطر."
                        error={titleError}
                        counter={titleLines
                            .slice(0, BANNER_LIMITS.titleLines)
                            .map((line) => `${line.length}/${BANNER_LIMITS.titleLine}`)
                            .join(" · ")}
                    >
                        <textarea
                            id="banner-title"
                            value={values.title}
                            onChange={(event) => set("title", event.target.value)}
                            onKeyDown={(event) => {
                                // A third line wouldn't fit the slide
                                if (event.key === "Enter" && titleLines.length >= BANNER_LIMITS.titleLines) event.preventDefault();
                            }}
                            rows={2}
                            placeholder={"متل: كل 4 شاورما\n+ وحدة مجاناً"}
                            aria-invalid={Boolean(titleError)}
                            aria-describedby={describedBy("banner-title", { hasHint: true, error: titleError })}
                            className={textareaClasses}
                        />
                    </FieldShell>

                    <div className="flex flex-col gap-6">
                        <ImagePicker
                            id="banner-image"
                            label="صورة الطبق"
                            hint="الأحسن صحن مقصوص على خلفية شفافة (PNG أو WebP)، بيطلع على طرف الشريحة فوق خلفية المطعم. بنصغّرها لحالنا."
                            value={values.image}
                            onChange={({ image }) => set("image", image)}
                        />
                        <FieldError id="banner-image-required" message={imageError} />
                    </div>

                    <div className="flex flex-col gap-14 rounded-2xl border border-border bg-surface p-12">
                        <Switch checked={values.hasAction} onChange={(checked) => set("hasAction", checked)} label="في زر على الشريحة" />

                        {values.hasAction && (
                            <>
                                <FieldShell
                                    htmlFor="banner-action-label"
                                    label="شو مكتوب على الزر"
                                    error={labelError}
                                    counter={`${values.actionLabel.length}/${BANNER_LIMITS.actionLabel}`}
                                >
                                    <input
                                        id="banner-action-label"
                                        value={values.actionLabel}
                                        onChange={(event) => set("actionLabel", event.target.value)}
                                        maxLength={BANNER_LIMITS.actionLabel}
                                        placeholder="متل: شوف العروض"
                                        aria-invalid={Boolean(labelError)}
                                        aria-describedby={describedBy("banner-action-label", { error: labelError })}
                                        className={inputClasses}
                                    />
                                </FieldShell>

                                <BannerTargetFields
                                    kind={values.targetKind}
                                    categoryId={values.categoryId}
                                    productId={values.productId}
                                    categories={data.categories}
                                    products={data.products}
                                    onKindChange={(kind) => set("targetKind", kind)}
                                    onCategoryChange={(id) => set("categoryId", id)}
                                    onProductChange={(id) => set("productId", id)}
                                    error={errorOf("action.target")}
                                    hiddenBecause={target?.hiddenBecause}
                                    offersOff={!bannerTargetsFromData(data).hasOffers}
                                />
                            </>
                        )}
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-12">
                        <Switch checked={values.isActive} onChange={(checked) => set("isActive", checked)} label="فعّالة (بتطلع بالمنيو)" />
                    </div>

                    {banner && (
                        <button
                            type="button"
                            onClick={() => setIsConfirmingDelete(true)}
                            className="inline-flex h-40 items-center gap-6 self-start rounded-full border border-border px-14 text-sm font-bold text-muted transition-colors hover:border-danger hover:text-danger"
                        >
                            <FiTrash2 aria-hidden="true" />
                            حذف الشريحة
                        </button>
                    )}

                    <SaveBar
                        isDirty={isDirty || !banner}
                        isSaving={isSaving}
                        submitLabel={banner ? "احفظ" : "أضف الشريحة"}
                        onDiscard={() => {
                            setValues(initial);
                            setError(undefined);
                        }}
                    />
                </div>
            </form>

            <ConfirmDialog
                open={isConfirmingDelete}
                title="حذف الشريحة؟"
                message="رح تنشال نهائياً من بانر المنيو. إذا بدك توقفها لفترة بس، طفّي «فعّالة» بدل الحذف. ما فيك تتراجع عن هالخطوة."
                confirmLabel="إي، احذفها"
                onConfirm={remove}
                onCancel={() => setIsConfirmingDelete(false)}
            />
        </>
    );
};

export default BannerForm;
