"use client";

import AppErrorAlert from "@/components/dashboard/feedback/AppErrorAlert";
import FieldShell, { describedBy } from "@/components/dashboard/form/FieldShell";
import { inputClasses } from "@/components/dashboard/form/field-styles";
import SaveBar from "@/components/dashboard/form/SaveBar";
import { useFormGuards } from "@/hooks/useFormGuards";
import { useSingleSubmit } from "@/hooks/useSingleSubmit";
import { fieldError, type AppError } from "@/lib/api/errors";
import { isSameContent, toHeroFormValues, toHeroInput, type HeroFormValues } from "@/lib/dashboard/home-content-form";
import { repository } from "@/lib/dashboard/repository";
import { HERO_LIMITS } from "@/lib/dashboard/validation";
import type { HeroContent } from "@/types/content";
import { useRef, useState, type FormEvent } from "react";
import FeatureIconPicker from "./FeatureIconPicker";

interface HeroFormProps {
    hero: HeroContent;
    /** After a save; the parent remounts the form with the saved values. */
    onSaved: () => void;
}

// The hero's texts in one form, saved together. Stays on the page after a
// save (no list to go back to).
const HeroForm = ({ hero, onSaved }: HeroFormProps) => {
    const formRef = useRef<HTMLFormElement>(null);
    const [initial] = useState(() => toHeroFormValues(hero));
    const [values, setValues] = useState(initial);
    const [error, setError] = useState<AppError>();
    const { isSaving, run } = useSingleSubmit();
    const input = toHeroInput(values);
    const isDirty = !isSameContent(input, toHeroInput(initial));
    useFormGuards(formRef, error, isDirty);

    const set = <K extends keyof HeroFormValues>(key: K, value: HeroFormValues[K]) =>
        setValues((current) => ({ ...current, [key]: value }));
    const setFeature = (index: number, changes: Partial<HeroFormValues["features"][number]>) =>
        setValues((current) => ({
            ...current,
            features: current.features.map((feature, at) => (at === index ? { ...feature, ...changes } : feature)),
        }));
    const errorOf = (field: string) => fieldError(error, field);

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const result = await run(() => repository.saveHero(input));
        if (!result) return; // a second tap while saving
        if (!result.ok) return setError(result.error);
        onSaved();
    };

    // One plain text field (all the hero's fields but the features)
    const textField = (
        field: "badge" | "headline" | "primaryActionLabel" | "secondaryActionLabel",
        label: string,
        maxLength: number,
        placeholder: string,
        hint?: string
    ) => {
        const id = `hero-${field}`;
        const message = errorOf(field);
        return (
            <FieldShell htmlFor={id} label={label} hint={hint} error={message} counter={`${values[field].length}/${maxLength}`}>
                <input
                    id={id}
                    value={values[field]}
                    onChange={(event) => set(field, event.target.value)}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    aria-invalid={Boolean(message)}
                    aria-describedby={describedBy(id, { hasHint: Boolean(hint), error: message })}
                    className={inputClasses}
                />
            </FieldShell>
        );
    };

    return (
        <form ref={formRef} onSubmit={submit} noValidate className="flex w-full max-w-720 flex-col gap-18">
            {error && <AppErrorAlert error={error} />}

            {textField("badge", "الشارة فوق الاسم (اختياري)", HERO_LIMITS.badge, "متل: من قلب السويداء")}
            {textField(
                "headline",
                "الجملة الرئيسية",
                HERO_LIMITS.headline,
                "متل: شاورما بطعم أصيل",
                "بتطلع تحت اسم المطعم بخط كبير. خليها قصيرة لتبيّن منيح على الموبايل."
            )}

            <div className="grid gap-18 sm:grid-cols-2">
                {textField("primaryActionLabel", "الزر الأول (بيفتح المنيو)", HERO_LIMITS.actionLabel, "متل: اطلب الآن")}
                {textField("secondaryActionLabel", "الزر التاني (بينزل لـ«من نحن»)", HERO_LIMITS.actionLabel, "متل: من نحن")}
            </div>

            <fieldset className="flex flex-col gap-12">
                <legend className="mb-6 text-sm font-bold">الميزات التلاتة (تحت الأزرار)</legend>
                {values.features.map((feature, index) => {
                    const id = `hero-feature-${index}`;
                    const message = errorOf(`features.${index}.label`) ?? errorOf(`features.${index}.icon`);
                    return (
                        <div key={index} className="flex flex-col gap-10 rounded-2xl border border-border bg-surface p-12">
                            <FieldShell
                                htmlFor={id}
                                label={`الميزة ${index + 1}`}
                                error={message}
                                counter={`${feature.label.length}/${HERO_LIMITS.featureLabel}`}
                            >
                                <input
                                    id={id}
                                    value={feature.label}
                                    onChange={(event) => setFeature(index, { label: event.target.value })}
                                    maxLength={HERO_LIMITS.featureLabel}
                                    placeholder="متل: مكونات طازجة يوميًا"
                                    aria-invalid={Boolean(message)}
                                    aria-describedby={describedBy(id, { error: message })}
                                    className={inputClasses}
                                />
                            </FieldShell>
                            <FeatureIconPicker
                                name={`hero-feature-icon-${index}`}
                                label={`أيقونة الميزة ${index + 1}`}
                                value={feature.icon}
                                onChange={(icon) => setFeature(index, { icon })}
                            />
                        </div>
                    );
                })}
            </fieldset>

            <SaveBar
                isDirty={isDirty}
                isSaving={isSaving}
                submitLabel="احفظ الواجهة"
                onDiscard={() => {
                    setValues(initial);
                    setError(undefined);
                }}
            />
        </form>
    );
};

export default HeroForm;
