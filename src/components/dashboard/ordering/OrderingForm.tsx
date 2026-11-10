"use client";

import AppErrorAlert from "@/components/dashboard/feedback/AppErrorAlert";
import FieldError from "@/components/dashboard/feedback/FieldError";
import FieldShell, { describedBy } from "@/components/dashboard/form/FieldShell";
import { inputClasses } from "@/components/dashboard/form/field-styles";
import SaveBar from "@/components/dashboard/form/SaveBar";
import Switch from "@/components/dashboard/Switch";
import { useFormGuards } from "@/hooks/useFormGuards";
import { useSingleSubmit } from "@/hooks/useSingleSubmit";
import { fieldError, type AppError } from "@/lib/api/errors";
import { formatPhone } from "@/lib/contact";
import {
    parseOrderingForm,
    toOrderingDraft,
    toOrderingFormValues,
    type BranchTablesValues,
    type OrderingFormValues,
} from "@/lib/dashboard/ordering-form";
import { repository } from "@/lib/dashboard/repository";
import { ORDERING_LIMITS } from "@/lib/dashboard/validation";
import { buildOrderMessage, fillTemplate } from "@/lib/order";
import { branchWhatsApp, publicPhones } from "@/lib/site-info";
import type { SiteInfo } from "@/types/content";
import type { PricedCartLine } from "@/types/cart";
import type { Product } from "@/types/menu";
import type { OrderDetails, OrderingSettings } from "@/types/order";
import Link from "next/link";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import MessagePreview from "./MessagePreview";
import TemplateField from "./TemplateField";

interface OrderingFormProps {
    ordering: OrderingSettings;
    /** Numbers and branches the settings point at (edited on /dashboard/info). */
    info: SiteInfo;
    /** The first available ones fill the preview order. */
    products: readonly Product[];
    restaurantName: string;
    /** After a save; the parent remounts the form with the saved values. */
    onSaved: () => void;
}

const cardClasses = "flex flex-col gap-14 rounded-2xl border border-border bg-surface p-14";
const noteClasses = "rounded-xl bg-background px-12 py-10 text-xs leading-relaxed text-muted";
const infoLink = "font-bold text-primary underline underline-offset-4";

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

const SAMPLE_REF = "1011-2030-K7";
const SAMPLE_NAME = "أحمد";

/** A small sample order from the real menu (two available items). */
function sampleLines(products: readonly Product[]): PricedCartLine[] {
    return products
        .filter((product) => product.isAvailable)
        .slice(0, 2)
        .map((product, index) => {
            const quantity = index === 0 ? 2 : 1;
            return {
                itemKey: `product:${product.id}`,
                lineId: product.id,
                quantity,
                name: product.name,
                unitPrice: product.price,
                lineTotal: product.price * quantity,
            };
        });
}

// Where orders go and what they say: delivery, tables per branch, and the
// message texts, saved together. Numbers are picked from the restaurant info.
const OrderingForm = ({ ordering, info, products, restaurantName, onSaved }: OrderingFormProps) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [initial] = useState(() => toOrderingFormValues(ordering, info));
    const [values, setValues] = useState(initial);
    const [error, setError] = useState<AppError>();
    const { isSaving, run } = useSingleSubmit();
    const draft = toOrderingDraft(values);
    const isDirty = JSON.stringify(values) !== JSON.stringify(initial);
    useFormGuards(formRef, error, isDirty);

    const set = <K extends keyof OrderingFormValues>(key: K, value: OrderingFormValues[K]) =>
        setValues((current) => ({ ...current, [key]: value }));
    const setBranch = (branchId: string, changes: Partial<BranchTablesValues>) =>
        setValues((current) => ({
            ...current,
            branches: current.branches.map((branch) => (branch.branchId === branchId ? { ...branch, ...changes } : branch)),
        }));
    const errorOf = (field: string) => fieldError(error, field);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsed = parseOrderingForm(values, info);
        if (!parsed.ok) return setError(parsed.error);
        const result = await run(() => repository.saveOrdering(parsed.data));
        if (!result) return; // a second tap while saving
        if (!result.ok) return setError(result.error);
        onSaved();
    };

    // Delivery goes to one of the restaurant's own numbers with WhatsApp
    const deliveryPhones = publicPhones(info.phones).filter((phone) => phone.hasWhatsApp);
    const hasChosenPhone = deliveryPhones.some((phone) => phone.id === values.phoneId);

    // The preview: a delivery order, or a table order when only tables are on
    const firstTablesBranch = info.branches.find((branch) =>
        values.branches.some((setting) => setting.branchId === branch.id && setting.isEnabled)
    );
    const asTable = !values.deliveryEnabled && values.dineInEnabled && firstTablesBranch;
    const details: OrderDetails = asTable
        ? { type: "dineIn", name: SAMPLE_NAME, branchName: firstTablesBranch.name, tableNumber: 4 }
        : { type: "delivery", name: SAMPLE_NAME, phone: "0930123456", address: "السويداء، المحوري، جانب الصيدلية" };
    const lines = sampleLines(products);
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const message = buildOrderMessage({
        orderRef: SAMPLE_REF,
        restaurantName,
        template: draft.message,
        details,
        lines,
        orderNote: "",
        subtotal,
        // Like the checkout: the fee only on delivery orders
        deliveryFee: details.type === "delivery" ? draft.delivery.fee : 0,
    });
    const thankYou = fillTemplate(draft.thankYou, { restaurant: restaurantName, name: SAMPLE_NAME });

    const feeError = errorOf("delivery.fee");
    const phoneError = errorOf("delivery.phoneId");
    const fieldIds = { fee: "ordering-fee", phone: "ordering-phone" };

    return (
        <form ref={formRef} onSubmit={submit} noValidate className="flex w-full max-w-720 flex-col gap-32">
            {error && <AppErrorAlert error={error} />}

            {/* =========================
                DELIVERY
            ========================== */}

            <Section id="ordering-delivery-heading" title="التوصيل" hint="الزبون بيكتب عنوانه، والطلب بيوصلكن رسالة واتساب.">
                <div className={cardClasses}>
                    <Switch checked={values.deliveryEnabled} onChange={(isEnabled) => set("deliveryEnabled", isEnabled)} label="طلبات التوصيل شغّالة" />

                    <FieldShell htmlFor={fieldIds.fee} label="رسوم التوصيل" hint="بالليرة السورية. اكتب 0 إذا التوصيل مجاني." error={feeError}>
                        <input
                            id={fieldIds.fee}
                            value={values.fee}
                            onChange={(event) => set("fee", event.target.value)}
                            inputMode="numeric"
                            dir="ltr"
                            placeholder="150"
                            aria-invalid={Boolean(feeError)}
                            aria-describedby={describedBy(fieldIds.fee, { hasHint: true, error: feeError })}
                            className={`${inputClasses} w-160 text-start tabular-nums`}
                        />
                    </FieldShell>

                    {deliveryPhones.length > 0 ? (
                        <FieldShell
                            htmlFor={fieldIds.phone}
                            label="رقم التوصيل"
                            hint="من أرقام المطعم اللي عليها واتساب. لتضيف رقم أو تغيّره: «معلومات المطعم»."
                            error={phoneError}
                        >
                            <select
                                id={fieldIds.phone}
                                value={hasChosenPhone ? values.phoneId : ""}
                                onChange={(event) => set("phoneId", event.target.value)}
                                aria-invalid={Boolean(phoneError)}
                                aria-describedby={describedBy(fieldIds.phone, { hasHint: true, error: phoneError })}
                                className={`${inputClasses} tabular-nums`}
                            >
                                {!hasChosenPhone && (
                                    <option value="" disabled>
                                        اختار رقم
                                    </option>
                                )}
                                {deliveryPhones.map((phone) => (
                                    <option key={phone.id} value={phone.id} dir="ltr">
                                        {formatPhone(phone.number)}
                                    </option>
                                ))}
                            </select>
                        </FieldShell>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <p className={noteClasses}>
                                ما في رقم للمطعم عليه واتساب. ضيف واحد من{" "}
                                <Link href="/dashboard/info" className={infoLink}>
                                    معلومات المطعم
                                </Link>
                                ، وبعدين اختاره هون.
                            </p>
                            {/* No select to focus: the switch carries the error */}
                            <FieldError id={`${fieldIds.phone}-error`} message={phoneError} />
                        </div>
                    )}
                </div>
            </Section>

            {/* =========================
                TABLES
            ========================== */}

            <Section
                id="ordering-tables-heading"
                title="الطلب من الطاولة"
                hint="الزبون بيمسح كود الطاولة وبيطلب من موبايله. الطلب بيروح على رقم واتساب الفرع."
            >
                <div className={cardClasses}>
                    <Switch checked={values.dineInEnabled} onChange={(isEnabled) => set("dineInEnabled", isEnabled)} label="طلبات الطاولات شغّالة" />
                    <FieldError id="ordering-dine-in-error" message={errorOf("dineIn")} />
                </div>

                {info.branches.map((branch) => {
                    const index = values.branches.findIndex((setting) => setting.branchId === branch.id);
                    const setting = values.branches[index];
                    const phone = branchWhatsApp(info.phones, branch.id);
                    const countId = `ordering-tables-${branch.id}`;
                    const countError = errorOf(`dineIn.branches.${index}.tableCount`);
                    const switchError = errorOf(`dineIn.branches.${index}.isEnabled`);
                    return (
                        <div key={branch.id} className={cardClasses}>
                            <div className="flex flex-col gap-6">
                                <h3 className="font-extrabold">{branch.name}</h3>
                                {phone ? (
                                    <p className="text-xs text-muted">
                                        الطلبات بتروح على{" "}
                                        <bdi dir="ltr" className="font-bold text-foreground tabular-nums">
                                            {formatPhone(phone.number)}
                                        </bdi>{" "}
                                        (رقم عامل الصالة).
                                    </p>
                                ) : (
                                    <p className={noteClasses}>
                                        هالفرع ما إلو رقم واتساب، فما فيك تشغّل طاولاته. ضيف «رقم عامل الصالة» من{" "}
                                        <Link href="/dashboard/info" className={infoLink}>
                                            معلومات المطعم
                                        </Link>
                                        .
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-4">
                                <Switch
                                    checked={setting.isEnabled}
                                    onChange={(isEnabled) => setBranch(branch.id, { isEnabled })}
                                    label="طاولات هالفرع شغّالة"
                                    // Can still be turned off when its number is gone
                                    disabled={!phone && !setting.isEnabled}
                                />
                                <FieldError id={`${countId}-switch-error`} message={switchError} />
                            </div>

                            <FieldShell
                                htmlFor={countId}
                                label="عدد الطاولات"
                                hint={`مرقّمة من 1. أقصى شي ${ORDERING_LIMITS.maxTables}.`}
                                error={countError}
                            >
                                <input
                                    id={countId}
                                    value={setting.tableCount}
                                    onChange={(event) => setBranch(branch.id, { tableCount: event.target.value })}
                                    inputMode="numeric"
                                    dir="ltr"
                                    placeholder="10"
                                    aria-invalid={Boolean(countError)}
                                    aria-describedby={describedBy(countId, { hasHint: true, error: countError })}
                                    className={`${inputClasses} w-120 text-start tabular-nums`}
                                />
                            </FieldShell>
                        </div>
                    );
                })}
            </Section>

            {/* =========================
                MESSAGE TEXTS + PREVIEW
            ========================== */}

            <Section
                id="ordering-message-heading"
                title="نص الرسالة"
                hint="أول سطر وآخر سطر برسالة الطلب، بلسان الزبون. الوسط (الأصناف والحساب) ثابت لحتى يقرأه الكاشير بنفس الترتيب كل مرة."
            >
                <div className={cardClasses}>
                    <TemplateField
                        id="ordering-greeting"
                        label="التحية (أول سطر)"
                        value={values.greeting}
                        onChange={(text) => set("greeting", text)}
                        maxLength={ORDERING_LIMITS.greeting}
                        placeholder="مرحبا {اسم المطعم}، بدي اطلب:"
                        error={errorOf("message.greeting")}
                    />
                    <TemplateField
                        id="ordering-closing"
                        label="الختام (آخر سطر، اختياري)"
                        value={values.closing}
                        onChange={(text) => set("closing", text)}
                        maxLength={ORDERING_LIMITS.closing}
                        placeholder="شكراً إلكن"
                        error={errorOf("message.closing")}
                    />
                    <TemplateField
                        id="ordering-thank-you"
                        label="رسالة الشكر بالموقع"
                        hint="بتطلع للزبون بعد ما ينفتح الواتساب، بلسان المطعم."
                        value={values.thankYou}
                        onChange={(text) => set("thankYou", text)}
                        maxLength={ORDERING_LIMITS.thankYou}
                        placeholder="شكراً {اسم الزبون}! طلبك جاهز عالواتساب، بس اكبس إرسال."
                        error={errorOf("thankYou")}
                    />
                </div>

                <MessagePreview message={message} thankYou={thankYou} />
            </Section>

            <SaveBar
                isDirty={isDirty}
                isSaving={isSaving}
                submitLabel="احفظ إعدادات الطلب"
                onDiscard={() => {
                    setValues(initial);
                    setError(undefined);
                }}
            />
        </form>
    );
};

export default OrderingForm;
