"use client";

import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import AppErrorAlert from "@/components/dashboard/feedback/AppErrorAlert";
import FieldError from "@/components/dashboard/feedback/FieldError";
import FieldShell, { describedBy } from "@/components/dashboard/form/FieldShell";
import { inputClasses, textareaClasses } from "@/components/dashboard/form/field-styles";
import SaveBar from "@/components/dashboard/form/SaveBar";
import Switch from "@/components/dashboard/Switch";
import { SOCIAL_ICONS } from "@/components/ui/social-icons";
import { useFormGuards } from "@/hooks/useFormGuards";
import { useSingleSubmit } from "@/hooks/useSingleSubmit";
import { appError, fieldError, type AppError } from "@/lib/api/errors";
import { formatPhone, normalizePhone } from "@/lib/contact";
import { repository } from "@/lib/dashboard/repository";
import { hasDineIn, phoneUses } from "@/lib/dashboard/site-info";
import {
    isHalfHours,
    isSameSiteInfo,
    toSiteInfoFormValues,
    toSiteInfoInput,
    type BranchValues,
    type PhoneValues,
    type SiteInfoFormValues,
} from "@/lib/dashboard/site-info-form";
import { SITE_INFO_LIMITS } from "@/lib/dashboard/validation";
import { hoursText, SOCIAL_PLATFORMS } from "@/lib/site-info";
import type { SiteInfo, SocialPlatform } from "@/types/content";
import type { OrderingSettings } from "@/types/order";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { FiPlus, FiTrash2, FiX } from "react-icons/fi";

interface SiteInfoFormProps {
    info: SiteInfo;
    /** To tell which numbers and branches orders depend on. */
    ordering: OrderingSettings;
    /** After a save; the parent remounts the form with the saved values. */
    onSaved: () => void;
}

const cardClasses = "flex flex-col gap-14 rounded-2xl border border-border bg-surface p-14";
const smallButton =
    "inline-flex h-36 items-center gap-6 rounded-full px-12 text-xs font-bold text-muted transition-colors hover:text-danger disabled:pointer-events-none disabled:opacity-40";
const addButton =
    "inline-flex h-40 items-center gap-6 self-start rounded-full border border-dashed border-border px-14 text-sm font-bold transition-colors hover:border-primary hover:text-primary";

const Section = ({ id, title, hint, children }: { id: string; title: string; hint?: string; children: ReactNode }) => (
    <section aria-labelledby={id} className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
            <h2 id={id} className="text-lg font-extrabold">
                {title}
            </h2>
            {hint && <p className="text-sm text-muted">{hint}</p>}
        </div>
        {children}
    </section>
);

const nextKey = (rows: readonly { key: number }[]) => Math.max(-1, ...rows.map((row) => row.key)) + 1;

// Everything the footer shows (and Google reads), in one form saved together:
// tagline, phones, branches, opening hours, social links. Stays on the page.
const SiteInfoForm = ({ info, ordering, onSaved }: SiteInfoFormProps) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [initial] = useState(() => toSiteInfoFormValues(info));
    const [values, setValues] = useState(initial);
    const [error, setError] = useState<AppError>();
    const { isSaving, run } = useSingleSubmit();
    const [branchToDelete, setBranchToDelete] = useState<BranchValues>();
    const input = toSiteInfoInput(values);
    const isDirty = !isSameSiteInfo(input, toSiteInfoInput(initial)) || isHalfHours(values);
    useFormGuards(formRef, error, isDirty);

    const set = <K extends keyof SiteInfoFormValues>(key: K, value: SiteInfoFormValues[K]) =>
        setValues((current) => ({ ...current, [key]: value }));
    const setPhone = (key: number, changes: Partial<PhoneValues>) =>
        setValues((current) => ({ ...current, phones: current.phones.map((phone) => (phone.key === key ? { ...phone, ...changes } : phone)) }));
    const setBranch = (key: number, changes: Partial<BranchValues>) =>
        setValues((current) => ({
            ...current,
            branches: current.branches.map((branch) => (branch.key === key ? { ...branch, ...changes } : branch)),
        }));
    // Its staff numbers go with it (they were never shown on the site)
    const removeBranch = (removed: BranchValues) =>
        setValues((current) => ({
            ...current,
            branches: current.branches.filter((branch) => branch.key !== removed.key),
            phones: current.phones.filter((phone) => !removed.id || phone.branchId !== removed.id),
        }));
    const branchPhoneCount = (branch: BranchValues) => (branch.id ? values.phones.filter((phone) => phone.branchId === branch.id).length : 0);
    const addPhone = (branchId: string) =>
        set("phones", [...values.phones, { key: nextKey(values.phones), id: "", number: "", hasWhatsApp: true, branchId }]);
    const errorOf = (field: string) => fieldError(error, field);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isHalfHours(values)) {
            const message = "اختار ساعة الفتح وساعة السكّر، أو فضّي التنين";
            return setError(appError("validation", { fieldErrors: { openingHours: [message] } }));
        }
        const result = await run(() => repository.saveSiteInfo(input));
        if (!result) return; // a second tap while saving
        if (!result.ok) return setError(result.error);
        onSaved();
    };

    // Orders depend on the saved phones (by id): those can't be deleted or lose WhatsApp here
    const usesOf = (phone: PhoneValues) => {
        const saved = info.phones.find((candidate) => candidate.id === phone.id);
        return saved && saved.branchId === (phone.branchId || undefined) ? phoneUses(ordering, info, saved) : [];
    };

    const taglineError = errorOf("tagline");
    const hoursError = errorOf("openingHours");
    const canAddPhone = values.phones.length < SITE_INFO_LIMITS.phones;
    const canAddBranch = values.branches.length < SITE_INFO_LIMITS.branches;
    const restaurantPhones = values.phones.filter((phone) => !phone.branchId);

    // One phone card; `label` is "الرقم 1" or "رقم عامل الصالة". Errors use the
    // phone's place in the whole list (the order the API receives them in).
    const phoneCard = (phone: PhoneValues, label: string, isOnly: boolean) => {
        const index = values.phones.indexOf(phone);
        const id = `info-phone-${phone.key}`;
        const message = errorOf(`phones.${index}.number`);
        const uses = usesOf(phone);
        const normalized = normalizePhone(phone.number);
        return (
            <div key={phone.key} className={phone.branchId ? "flex flex-col gap-10 rounded-xl border border-border bg-background p-12" : cardClasses}>
                <FieldShell htmlFor={id} label={label} error={message}>
                    <input
                        id={id}
                        value={phone.number}
                        onChange={(event) => setPhone(phone.key, { number: event.target.value })}
                        // Tidy spacing once it's a valid number
                        onBlur={() => normalized && setPhone(phone.key, { number: formatPhone(normalized) })}
                        type="tel"
                        inputMode="tel"
                        dir="ltr"
                        placeholder="0930 123 456"
                        aria-invalid={Boolean(message)}
                        aria-describedby={describedBy(id, { error: message }) ?? (uses.length ? `${id}-uses` : undefined)}
                        className={`${inputClasses} text-start tabular-nums`}
                    />
                </FieldShell>
                {uses.length > 0 && (
                    <p id={`${id}-uses`} className="text-xs text-muted">
                        بتوصل عليه طلبات: {uses.join("، ")}. فيك تغيّر الرقم، والطلبات بتلحقه.
                    </p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-8">
                    <Switch
                        checked={phone.hasWhatsApp}
                        onChange={(hasWhatsApp) => setPhone(phone.key, { hasWhatsApp })}
                        label="عليه واتساب"
                        // Orders are sent on WhatsApp
                        disabled={uses.length > 0}
                    />
                    <button
                        type="button"
                        onClick={() => set("phones", values.phones.filter((candidate) => candidate.key !== phone.key))}
                        disabled={uses.length > 0 || isOnly}
                        className={smallButton}
                    >
                        <FiTrash2 aria-hidden="true" />
                        احذف {label}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <form ref={formRef} onSubmit={submit} noValidate className="flex w-full max-w-720 flex-col gap-32">
                {error && <AppErrorAlert error={error} />}

                {/* =========================
                    TAGLINE + SOCIAL (under the logo)
                ========================== */}

                <Section id="info-brand-heading" title="تحت اللوغو" hint="جملة التعريف وأيقونات صفحاتكن، بأول الفوتر.">
                    <div className={cardClasses}>
                        <FieldShell
                            htmlFor="info-tagline"
                            label="جملة التعريف"
                            hint="اكبس Enter لتنزل سطر (3 أسطر بالكتير)."
                            error={taglineError}
                            counter={`${values.tagline.length}/${SITE_INFO_LIMITS.tagline}`}
                        >
                            <textarea
                                id="info-tagline"
                                value={values.tagline}
                                onChange={(event) => set("tagline", event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" && values.tagline.split("\n").length >= SITE_INFO_LIMITS.taglineLines) event.preventDefault();
                                }}
                                maxLength={SITE_INFO_LIMITS.tagline}
                                rows={3}
                                placeholder="متل: شاورما بطعم أصيل من قلب السويداء"
                                aria-invalid={Boolean(taglineError)}
                                aria-describedby={describedBy("info-tagline", { hasHint: true, error: taglineError })}
                                className={textareaClasses}
                            />
                        </FieldShell>

                        <fieldset className="flex flex-col gap-10">
                            <legend className="mb-6 text-sm font-bold">صفحات السوشال (اختياري)</legend>
                            <p className="-mt-4 text-xs text-muted">الصق رابط الصفحة. الحقل الفاضي ما بيطلع بالموقع.</p>
                            {SOCIAL_PLATFORMS.map(({ platform, name, example }) => {
                                const id = `info-social-${platform}`;
                                const index = input.socialLinks?.findIndex((link) => link.platform === platform) ?? -1;
                                const message = index >= 0 ? errorOf(`socialLinks.${index}.url`) : undefined;
                                const Icon = SOCIAL_ICONS[platform as SocialPlatform];
                                return (
                                    <div key={platform} className="flex flex-col gap-4">
                                        <div className="flex items-center gap-8">
                                            <label htmlFor={id} className="flex w-108 shrink-0 items-center gap-8 text-sm font-bold">
                                                <span aria-hidden="true" className="flex size-32 items-center justify-center rounded-full border border-border text-base">
                                                    <Icon />
                                                </span>
                                                {name}
                                            </label>
                                            <input
                                                id={id}
                                                value={values.social[platform]}
                                                onChange={(event) => set("social", { ...values.social, [platform]: event.target.value })}
                                                type="url"
                                                inputMode="url"
                                                dir="ltr"
                                                placeholder={example}
                                                aria-invalid={Boolean(message)}
                                                aria-describedby={describedBy(id, { error: message })}
                                                className={`${inputClasses} min-w-0 text-start`}
                                            />
                                        </div>
                                        <FieldError id={`${id}-error`} message={message} />
                                    </div>
                                );
                            })}
                        </fieldset>
                    </div>
                </Section>

                {/* =========================
                    PHONES
                ========================== */}

                <Section
                    id="info-phones-heading"
                    title="أرقام المطعم"
                    hint="بتطلع بـ«تواصل معنا». الرقم اللي عليه واتساب بيفتح المحادثة، والباقي بيتصل. رقم عامل الصالة لكل فرع تحت بالفروع."
                >
                    {restaurantPhones.map((phone, index) => phoneCard(phone, `الرقم ${index + 1}`, restaurantPhones.length === 1))}
                    <FieldError id="info-phones-error" message={errorOf("phones")} />
                    {canAddPhone && (
                        <button type="button" onClick={() => addPhone("")} className={addButton}>
                            <FiPlus aria-hidden="true" />
                            أضف رقم للمطعم
                        </button>
                    )}
                </Section>

                {/* =========================
                    BRANCHES
                ========================== */}

                <Section id="info-branches-heading" title="الفروع" hint="بتطلع بـ«موقعنا»، وبتنقرأ لـGoogle.">
                    {values.branches.map((branch, index) => {
                        const ids = { name: `info-branch-${branch.key}-name`, address: `info-branch-${branch.key}-address`, map: `info-branch-${branch.key}-map` };
                        const errors = {
                            name: errorOf(`branches.${index}.name`),
                            address: errorOf(`branches.${index}.address`),
                            map: errorOf(`branches.${index}.mapUrl`),
                        };
                        return (
                            <div key={branch.key} className={cardClasses}>
                                <FieldShell htmlFor={ids.name} label="اسم الفرع" error={errors.name} counter={`${branch.name.length}/${SITE_INFO_LIMITS.branchName}`}>
                                    <input
                                        id={ids.name}
                                        value={branch.name}
                                        onChange={(event) => setBranch(branch.key, { name: event.target.value })}
                                        maxLength={SITE_INFO_LIMITS.branchName}
                                        placeholder="متل: فرع المحوري"
                                        aria-invalid={Boolean(errors.name)}
                                        aria-describedby={describedBy(ids.name, { error: errors.name })}
                                        className={inputClasses}
                                    />
                                </FieldShell>
                                <FieldShell
                                    htmlFor={ids.address}
                                    label="العنوان"
                                    error={errors.address}
                                    counter={`${branch.address.length}/${SITE_INFO_LIMITS.branchAddress}`}
                                >
                                    <input
                                        id={ids.address}
                                        value={branch.address}
                                        onChange={(event) => setBranch(branch.key, { address: event.target.value })}
                                        maxLength={SITE_INFO_LIMITS.branchAddress}
                                        placeholder="متل: السويداء، المحوري، مقابل كازية سرايا"
                                        aria-invalid={Boolean(errors.address)}
                                        aria-describedby={describedBy(ids.address, { error: errors.address })}
                                        className={inputClasses}
                                    />
                                </FieldShell>
                                <FieldShell
                                    htmlFor={ids.map}
                                    label="رابط الخريطة (اختياري)"
                                    hint="من Google Maps: افتح المحل، اكبس «مشاركة» وانسخ الرابط. بيطلع زر «افتح على الخريطة»."
                                    error={errors.map}
                                >
                                    <input
                                        id={ids.map}
                                        value={branch.mapUrl}
                                        onChange={(event) => setBranch(branch.key, { mapUrl: event.target.value })}
                                        type="url"
                                        inputMode="url"
                                        dir="ltr"
                                        placeholder="https://maps.app.goo.gl/…"
                                        aria-invalid={Boolean(errors.map)}
                                        aria-describedby={describedBy(ids.map, { hasHint: true, error: errors.map })}
                                        className={`${inputClasses} text-start`}
                                    />
                                </FieldShell>

                                {/* The branch's own numbers: table orders, not shown on the site */}
                                <div className="flex flex-col gap-8">
                                    <p className="text-sm font-bold">رقم عامل الصالة</p>
                                    <p className="-mt-4 text-xs text-muted">عليه بتوصل طلبات طاولات هالفرع. ما بيطلع بالموقع.</p>
                                    {branch.id ? (
                                        <>
                                            {values.phones
                                                .filter((phone) => phone.branchId === branch.id)
                                                .map((phone, phoneIndex, branchPhones) =>
                                                    phoneCard(phone, branchPhones.length > 1 ? `رقم الصالة ${phoneIndex + 1}` : "رقم الصالة", false)
                                                )}
                                            {canAddPhone && (
                                                <button type="button" onClick={() => addPhone(branch.id)} className={addButton}>
                                                    <FiPlus aria-hidden="true" />
                                                    أضف رقم للفرع
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <p className="rounded-xl bg-background px-12 py-10 text-xs text-muted">احفظ الفرع أول، وبعدين ضيفله رقم.</p>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    // Asks first when tables or numbers would go with it
                                    onClick={() =>
                                        (branch.id && hasDineIn(ordering, branch.id)) || branchPhoneCount(branch) > 0
                                            ? setBranchToDelete(branch)
                                            : removeBranch(branch)
                                    }
                                    disabled={values.branches.length === 1}
                                    className={`${smallButton} self-end`}
                                >
                                    <FiTrash2 aria-hidden="true" />
                                    احذف {branch.name.trim() || `الفرع ${index + 1}`}
                                </button>
                            </div>
                        );
                    })}
                    <FieldError id="info-branches-error" message={errorOf("branches")} />
                    {canAddBranch && (
                        <button
                            type="button"
                            onClick={() =>
                                set("branches", [...values.branches, { key: nextKey(values.branches), id: "", name: "", address: "", mapUrl: "" }])
                            }
                            className={addButton}
                        >
                            <FiPlus aria-hidden="true" />
                            أضف فرع
                        </button>
                    )}
                </Section>

                {/* =========================
                    OPENING HOURS
                ========================== */}

                <Section id="info-hours-heading" title="أوقات العمل" hint="نفس الوقت كل يوم. بيطلع بالفوتر وبيفهمه Google.">
                    <div className={cardClasses}>
                        <div className="flex flex-wrap items-end gap-12">
                            {(["opens", "closes"] as const).map((field) => (
                                <div key={field} className="flex flex-col gap-6">
                                    <label htmlFor={`info-${field}`} className="text-sm font-bold">
                                        {field === "opens" ? "بنفتح الساعة" : "بنسكّر الساعة"}
                                    </label>
                                    <input
                                        id={`info-${field}`}
                                        type="time"
                                        value={values[field]}
                                        onChange={(event) => set(field, event.target.value)}
                                        dir="ltr"
                                        aria-invalid={Boolean(hoursError)}
                                        aria-describedby={hoursError ? "info-hours-error" : "info-hours-preview"}
                                        className={`${inputClasses} w-160 text-center tabular-nums`}
                                    />
                                </div>
                            ))}
                            {(values.opens || values.closes) && (
                                <button
                                    type="button"
                                    onClick={() => setValues((current) => ({ ...current, opens: "", closes: "" }))}
                                    className={`${smallButton} mb-4`}
                                >
                                    <FiX aria-hidden="true" />
                                    بلا أوقات
                                </button>
                            )}
                        </div>
                        <p id="info-hours-preview" className="text-sm text-muted">
                            {values.opens && values.closes
                                ? `بيطلع بالموقع: «${hoursText(values.opens, values.closes)}»`
                                : "بدون أوقات، ما بيطلع شي عن الدوام بالموقع."}
                        </p>
                        <FieldError id="info-hours-error" message={hoursError} />
                    </div>
                </Section>

                <SaveBar
                    isDirty={isDirty}
                    isSaving={isSaving}
                    submitLabel="احفظ المعلومات"
                    onDiscard={() => {
                        setValues(initial);
                        setError(undefined);
                    }}
                />
            </form>

            <ConfirmDialog
                open={Boolean(branchToDelete)}
                title={`حذف ${branchToDelete?.name ?? "الفرع"}؟`}
                message={[
                    branchToDelete?.id && hasDineIn(ordering, branchToDelete.id)
                        ? "رح تنشال إعدادات طاولاته كمان (وأكواد QR تبعه ما عاد تشتغل)."
                        : "",
                    branchToDelete && branchPhoneCount(branchToDelete) > 0 ? "ورقم عامل الصالة تبعه بينحذف معه." : "",
                    "الحذف بيصير لما تحفظ.",
                ]
                    .filter(Boolean)
                    .join(" ")}
                confirmLabel="إي، احذفه"
                onConfirm={() => {
                    if (branchToDelete) removeBranch(branchToDelete);
                    setBranchToDelete(undefined);
                }}
                onCancel={() => setBranchToDelete(undefined)}
            />
        </>
    );
};

export default SiteInfoForm;
