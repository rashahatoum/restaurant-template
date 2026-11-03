"use client";

import AppErrorAlert from "@/components/dashboard/feedback/AppErrorAlert";
import ErrorState from "@/components/dashboard/feedback/ErrorState";
import FieldError from "@/components/dashboard/feedback/FieldError";
import FormAlert from "@/components/dashboard/feedback/FormAlert";
import SessionExpiredDialog from "@/components/dashboard/feedback/SessionExpiredDialog";
import Toast from "@/components/dashboard/feedback/Toast";
import { appError, fieldError, fromHttpResponse, type AppError } from "@/lib/api/errors";
import { useState } from "react";
import { FiWifiOff } from "react-icons/fi";

// Samples shaped like real Laravel responses, run through the same mapper
// the API client will use (fromHttpResponse).
const validation = fromHttpResponse(422, {
    message: "The given data was invalid.",
    errors: {
        price: ["السعر لازم يكون رقم أكبر من صفر"],
        // An English message from the backend falls back to Arabic
        name: ["The name field is required."],
    },
});

const samples: { label: string; error: AppError }[] = [
    { label: "422 validation (form summary)", error: validation },
    { label: "401 session ended", error: fromHttpResponse(401, { message: "Unauthenticated." }) },
    { label: "403 forbidden", error: fromHttpResponse(403, {}) },
    { label: "404 not found", error: fromHttpResponse(404, {}) },
    { label: "409 conflict (Arabic message from the backend)", error: fromHttpResponse(409, { message: "ما فيك تحذف قسم فيه أصناف. انقلها لقسم تاني أول." }) },
    { label: "413 too large", error: fromHttpResponse(413, null) },
    { label: "429 too many tries", error: fromHttpResponse(429, {}) },
    { label: "500 server", error: fromHttpResponse(500, { message: "Server Error" }) },
    { label: "No connection", error: appError("offline") },
    { label: "Timeout", error: appError("timeout") },
];

const sectionTitle = "mb-12 font-display text-xl font-bold";

const ErrorsLab = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [retries, setRetries] = useState(0);

    return (
        <main className="mx-auto flex max-w-720 flex-col gap-40 px-16 py-40">
            <header>
                <h1 className="font-display text-3xl font-bold">رسائل الخطأ</h1>
                <p className="mt-6 text-sm text-muted">
                    كل رسالة ممكن تطلع بالـdashboard، مبنية من ردود بشكل ردود Laravel. (صفحة تطوير بس)
                </p>
            </header>

            <section>
                <h2 className={sectionTitle}>رسائل الشاشات (حسب نوع الخطأ)</h2>
                <ul className="flex flex-col gap-14">
                    {samples.map(({ label, error }) => (
                        <li key={label} className="flex flex-col gap-6">
                            <span dir="ltr" className="text-start text-xs text-muted">
                                {label}
                            </span>
                            <AppErrorAlert error={error} onRetry={() => setRetries((count) => count + 1)} />
                        </li>
                    ))}
                </ul>
                <p className="mt-10 text-xs text-muted">«جرّب مرة تانية» انكبس: {retries}</p>
            </section>

            <section>
                <h2 className={sectionTitle}>خطأ تحت الحقل (422)</h2>
                <div className="flex flex-col gap-14 rounded-2xl border border-border bg-surface p-16">
                    <label className="flex flex-col gap-6 text-sm font-bold">
                        اسم الصنف
                        <input
                            aria-invalid="true"
                            aria-describedby="lab-name-error"
                            className="h-44 rounded-full border border-danger bg-background px-16 text-base"
                        />
                        <FieldError id="lab-name-error" message={fieldError(validation, "name")} />
                    </label>
                    <label className="flex flex-col gap-6 text-sm font-bold">
                        السعر
                        <input
                            defaultValue="0"
                            inputMode="numeric"
                            aria-invalid="true"
                            aria-describedby="lab-price-error"
                            className="h-44 rounded-full border border-danger bg-background px-16 text-base"
                        />
                        <FieldError id="lab-price-error" message={fieldError(validation, "price")} />
                    </label>
                </div>
            </section>

            <section>
                <h2 className={sectionTitle}>إشعارات سريعة</h2>
                <div className="flex flex-col gap-10">
                    <Toast tone="success" message="انحفظ السعر" action={{ label: "تراجع", onClick: () => {} }} onClose={() => {}} />
                    <Toast tone="error" message="ما انحفظ: صار خلل عندنا" action={{ label: "جرّب مرة تانية", onClick: () => {} }} />
                    <Toast tone="warning" message="ما في اتصال بالإنترنت" />
                </div>
            </section>

            <section>
                <h2 className={sectionTitle}>رسائل عامة</h2>
                <div className="flex flex-col gap-10">
                    <FormAlert tone="success" title="انحفظ">
                        التعديلات صارت على الموقع.
                    </FormAlert>
                    <FormAlert tone="warning" icon={FiWifiOff} title="بدون إنترنت">
                        رح نحفظ لما يرجع الاتصال.
                    </FormAlert>
                </div>
            </section>

            <section>
                <h2 className={sectionTitle}>صفحة ما فتحت</h2>
                <div className="rounded-2xl border border-border bg-surface">
                    <ErrorState
                        title="ما قدرنا نفتح هالصفحة"
                        message="صار خلل غير متوقع. جرّب مرة تانية، وإذا ضلّت المشكلة ارجع للرئيسية."
                    />
                </div>
            </section>

            <section>
                <h2 className={sectionTitle}>انتهت الجلسة</h2>
                <button
                    type="button"
                    onClick={() => setIsDialogOpen(true)}
                    className="rounded-full border border-border px-16 py-8 font-bold transition-colors hover:border-primary hover:text-primary"
                >
                    اعرض النافذة
                </button>
                <SessionExpiredDialog open={isDialogOpen} returnTo="/dashboard" onClose={() => setIsDialogOpen(false)} />
            </section>
        </main>
    );
};

export default ErrorsLab;
