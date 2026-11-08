"use client";

import AppErrorAlert from "@/components/dashboard/feedback/AppErrorAlert";
import FieldError from "@/components/dashboard/feedback/FieldError";
import FieldShell, { describedBy } from "@/components/dashboard/form/FieldShell";
import HighlightInput from "@/components/dashboard/form/HighlightInput";
import ImagePicker from "@/components/dashboard/form/ImagePicker";
import { inputClasses } from "@/components/dashboard/form/field-styles";
import SaveBar from "@/components/dashboard/form/SaveBar";
import { useFormGuards } from "@/hooks/useFormGuards";
import { useSingleSubmit } from "@/hooks/useSingleSubmit";
import { fieldError, type AppError } from "@/lib/api/errors";
import { isSameContent, toAboutFormValues, toAboutInput, type AboutFormValues } from "@/lib/dashboard/home-content-form";
import { repository } from "@/lib/dashboard/repository";
import { ABOUT_LIMITS, paragraphField } from "@/lib/dashboard/validation";
import { toPlainText } from "@/lib/highlight";
import type { AboutContent } from "@/types/content";
import { useRef, useState, type FormEvent } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

interface AboutFormProps {
    about: AboutContent;
    /** After a save; the parent remounts the form with the saved values. */
    onSaved: () => void;
}

const HIGHLIGHT_HINT = "حدّد كلمات واكبس «ميّز» لتطلع بالبرتقالي.";

// «من نحن» in one form, saved together: titles, paragraphs (1 to 4), the
// closing line, photo and badge. Stays on the page after a save.
const AboutForm = ({ about, onSaved }: AboutFormProps) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [initial] = useState(() => toAboutFormValues(about));
    const [values, setValues] = useState(initial);
    const [error, setError] = useState<AppError>();
    const { isSaving, run } = useSingleSubmit();
    const input = toAboutInput(values, about);
    const isDirty = !isSameContent(input, toAboutInput(initial, about));
    useFormGuards(formRef, error, isDirty);

    const set = <K extends keyof AboutFormValues>(key: K, value: AboutFormValues[K]) =>
        setValues((current) => ({ ...current, [key]: value }));
    const setParagraph = (key: number, text: string) =>
        setValues((current) => ({
            ...current,
            paragraphs: current.paragraphs.map((paragraph) => (paragraph.key === key ? { ...paragraph, text } : paragraph)),
        }));
    const addParagraph = () =>
        setValues((current) => ({
            ...current,
            paragraphs: [...current.paragraphs, { key: Math.max(-1, ...current.paragraphs.map((p) => p.key)) + 1, text: "" }],
        }));
    const removeParagraph = (key: number) =>
        setValues((current) => ({ ...current, paragraphs: current.paragraphs.filter((paragraph) => paragraph.key !== key) }));
    const errorOf = (field: string) => fieldError(error, field);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = await run(() => repository.saveAbout(input));
        if (!result) return; // a second tap while saving
        if (!result.ok) return setError(result.error);
        onSaved();
    };

    const eyebrowError = errorOf("eyebrow");
    const titleError = errorOf("title");
    const closingError = errorOf("closing");
    const badgeError = errorOf("badge");
    const canAdd = values.paragraphs.length < ABOUT_LIMITS.paragraphs;

    return (
        <form ref={formRef} onSubmit={submit} noValidate className="flex w-full max-w-720 flex-col gap-18">
            {error && <AppErrorAlert error={error} />}

            <FieldShell
                htmlFor="about-eyebrow"
                label="العنوان الصغير"
                error={eyebrowError}
                counter={`${values.eyebrow.length}/${ABOUT_LIMITS.eyebrow}`}
            >
                <input
                    id="about-eyebrow"
                    value={values.eyebrow}
                    onChange={(event) => set("eyebrow", event.target.value)}
                    maxLength={ABOUT_LIMITS.eyebrow}
                    placeholder="متل: من قلب الخبرة... إلى قلب المذاق"
                    aria-invalid={Boolean(eyebrowError)}
                    aria-describedby={describedBy("about-eyebrow", { error: eyebrowError })}
                    className={inputClasses}
                />
            </FieldShell>

            <FieldShell
                htmlFor="about-title"
                label="العنوان"
                hint="حدّد كلمة واكبس «ميّز» ليطلع تحتها خط برتقالي."
                error={titleError}
                counter={`${toPlainText(values.title).length}/${ABOUT_LIMITS.title}`}
            >
                <HighlightInput
                    id="about-title"
                    value={values.title}
                    onChange={(title) => set("title", title)}
                    maxLength={ABOUT_LIMITS.title}
                    placeholder="متل: أهل الكرم... اسم على مسمّى"
                    invalid={Boolean(titleError)}
                    describedBy={describedBy("about-title", { hasHint: true, error: titleError })}
                />
            </FieldShell>

            {/* =========================
                PARAGRAPHS
            ========================== */}

            <fieldset className="flex flex-col gap-12" aria-describedby={errorOf("paragraphs") ? "about-paragraphs-error" : undefined}>
                <legend className="mb-6 text-sm font-bold">الفقرات</legend>

                {values.paragraphs.map((paragraph, index) => {
                    const id = `about-paragraph-${paragraph.key}`;
                    const message = errorOf(paragraphField(index));
                    return (
                        <div key={paragraph.key} className="flex flex-col gap-8 rounded-2xl border border-border bg-surface p-12">
                            <FieldShell
                                htmlFor={id}
                                label={`الفقرة ${index + 1}`}
                                hint={index === 0 ? HIGHLIGHT_HINT : undefined}
                                error={message}
                                counter={`${toPlainText(paragraph.text).length}/${ABOUT_LIMITS.paragraph}`}
                            >
                                <HighlightInput
                                    id={id}
                                    variant="text"
                                    value={paragraph.text}
                                    onChange={(text) => setParagraph(paragraph.key, text)}
                                    maxLength={ABOUT_LIMITS.paragraph}
                                    invalid={Boolean(message)}
                                    describedBy={describedBy(id, { hasHint: index === 0, error: message })}
                                />
                            </FieldShell>
                            {values.paragraphs.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeParagraph(paragraph.key)}
                                    className="inline-flex h-36 items-center gap-6 self-end rounded-full px-12 text-xs font-bold text-muted transition-colors hover:text-danger"
                                >
                                    <FiTrash2 aria-hidden="true" />
                                    احذف الفقرة {index + 1}
                                </button>
                            )}
                        </div>
                    );
                })}

                <FieldError id="about-paragraphs-error" message={errorOf("paragraphs")} />

                {canAdd ? (
                    <button
                        type="button"
                        onClick={addParagraph}
                        className="inline-flex h-40 items-center gap-6 self-start rounded-full border border-dashed border-border px-14 text-sm font-bold transition-colors hover:border-primary hover:text-primary"
                    >
                        <FiPlus aria-hidden="true" />
                        أضف فقرة
                    </button>
                ) : (
                    <p className="text-xs text-muted">
                        {ABOUT_LIMITS.paragraphs} فقرات بالكتير، لحتى يضل القسم مريح للقراءة.
                    </p>
                )}
            </fieldset>

            <FieldShell
                htmlFor="about-closing"
                label="الجملة الأخيرة"
                hint="بتطلع بخط كبير جنبها خط برتقالي، وبتبيّن كلمة كلمة. فيك تميّز كلمات فيها كمان."
                error={closingError}
                counter={`${toPlainText(values.closing).length}/${ABOUT_LIMITS.closing}`}
            >
                <HighlightInput
                    id="about-closing"
                    variant="text"
                    rows={2}
                    value={values.closing}
                    onChange={(closing) => set("closing", closing)}
                    maxLength={ABOUT_LIMITS.closing}
                    placeholder="متل: والكرم عنا مو مجرد اسم..."
                    invalid={Boolean(closingError)}
                    describedBy={describedBy("about-closing", { hasHint: true, error: closingError })}
                />
            </FieldShell>

            <div className="flex flex-col gap-6">
                <ImagePicker
                    id="about-image"
                    label="الصورة"
                    hint="صورة طولية كاملة (متل الشيف عم يقص الشاورما). أطرافها بتذوب بخلفية الصفحة. بنصغّرها لحالنا."
                    value={values.imageSrc}
                    onChange={({ image }) => set("imageSrc", image)}
                    fullPhoto
                />
                <FieldError id="about-image-required" message={errorOf("image")} />
            </div>

            <FieldShell
                htmlFor="about-badge"
                label="الشارة فوق الصورة (اختياري)"
                error={badgeError}
                counter={`${values.badge.length}/${ABOUT_LIMITS.badge}`}
            >
                <input
                    id="about-badge"
                    value={values.badge}
                    onChange={(event) => set("badge", event.target.value)}
                    maxLength={ABOUT_LIMITS.badge}
                    placeholder="متل: من قلب السويداء"
                    aria-invalid={Boolean(badgeError)}
                    aria-describedby={describedBy("about-badge", { error: badgeError })}
                    className={inputClasses}
                />
            </FieldShell>

            <SaveBar
                isDirty={isDirty}
                isSaving={isSaving}
                submitLabel="احفظ «من نحن»"
                onDiscard={() => {
                    setValues(initial);
                    setError(undefined);
                }}
            />
        </form>
    );
};

export default AboutForm;
