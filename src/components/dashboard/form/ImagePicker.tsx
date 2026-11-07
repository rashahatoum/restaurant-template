"use client";

import DashboardImage from "@/components/dashboard/DashboardImage";
import FieldError from "@/components/dashboard/feedback/FieldError";
import { fieldError, type AppError } from "@/lib/api/errors";
import { prepareImage } from "@/lib/dashboard/image-processing";
import { repository } from "@/lib/dashboard/repository";
import type { ImageStyle } from "@/types/menu";
import { useState, type ChangeEvent } from "react";
import { FiImage, FiLoader, FiTrash2 } from "react-icons/fi";

export interface PickedImage {
    image?: string;
    imageStyle?: ImageStyle;
}

interface ImagePickerProps {
    id: string;
    /** What the photo is for, e.g. "صورة الصنف". */
    label: string;
    /** Expected shape, e.g. "مربعة، والأفضل صحن على خلفية شفافة". */
    hint: string;
    value?: string;
    imageStyle?: ImageStyle;
    onChange: (next: PickedImage) => void;
    /** A small row (category cards) instead of a full field. */
    compact?: boolean;
    /** Category cards: always a full photo cropped square, whatever was detected. */
    fullPhoto?: boolean;
}

const buttonClasses =
    "inline-flex h-40 cursor-pointer items-center gap-6 rounded-full border border-border bg-background px-14 text-sm font-bold transition-colors hover:border-primary hover:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary";

// Pick a photo from the phone: it's resized and compressed in the browser,
// stored through the repository (IndexedDB now, the Laravel upload later),
// and its type (cut-out or full photo) is detected from transparency and
// returned with it, with nothing to choose (owner). Opening the file chooser
// needs no JS: a real file input (visually hidden) with a <label> styled as a button.
const ImagePicker = ({ id, label, hint, value, imageStyle, onChange, compact = false, fullPhoto = false }: ImagePickerProps) => {
    const [isBusy, setIsBusy] = useState(false);
    const [error, setError] = useState<AppError>();

    const pick = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // Same file picked twice in a row should still fire next time
        event.target.value = "";
        if (!file) return;

        setIsBusy(true);
        setError(undefined);
        const prepared = await prepareImage(file);
        const stored = prepared.ok ? await repository.uploadImage(prepared.data) : prepared;
        setIsBusy(false);

        if (!stored.ok) return setError(stored.error);
        onChange({ image: stored.data.src, imageStyle: prepared.ok ? prepared.data.suggestedStyle : undefined });
    };

    const message = error ? (fieldError(error, "image") ?? error.message) : undefined;
    const errorId = `${id}-error`;
    // Thumbnail like the site shows it (no style saved = cut-out, the data's default)
    const isPhoto = fullPhoto || imageStyle === "photo";

    const thumbnail = (
        <span className={`relative shrink-0 overflow-hidden rounded-xl bg-background ${compact ? "size-48" : "size-96"}`}>
            {isBusy ? (
                <FiLoader aria-hidden="true" className="absolute inset-0 m-auto animate-spin text-xl text-primary motion-reduce:animate-none" />
            ) : (
                <DashboardImage
                    src={value}
                    sizes={compact ? "48px" : "96px"}
                    className={isPhoto ? "object-cover" : "object-contain p-4"}
                />
            )}
        </span>
    );

    const actions = (
        <div className="flex flex-wrap items-center gap-8">
            <input
                id={id}
                type="file"
                accept="image/*"
                onChange={pick}
                disabled={isBusy}
                aria-describedby={[`${id}-hint`, message && errorId].filter(Boolean).join(" ")}
                className="peer sr-only"
            />
            <label htmlFor={id} className={buttonClasses}>
                <FiImage aria-hidden="true" />
                {isBusy ? "عم نجهّز الصورة…" : value ? "غيّر الصورة" : compact ? "ضيف صورة" : "اختار صورة"}
            </label>
            {value && !isBusy && (
                <button
                    type="button"
                    onClick={() => onChange({ image: undefined, imageStyle: undefined })}
                    aria-label={`شيل ${label}`}
                    className="flex size-40 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-danger hover:text-danger"
                >
                    <FiTrash2 aria-hidden="true" />
                </button>
            )}
        </div>
    );

    if (compact) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-10">
                    {thumbnail}
                    {actions}
                </div>
                <p id={`${id}-hint`} className="sr-only">
                    {hint}
                </p>
                <FieldError id={errorId} message={message} />
            </div>
        );
    }

    return (
        <fieldset className="flex flex-col gap-10 rounded-2xl border border-border bg-surface p-12">
            <legend className="sr-only">{label}</legend>
            <div className="flex items-center gap-12">
                {thumbnail}
                <div className="flex min-w-0 flex-col gap-8">
                    <p className="text-sm font-bold">{label}</p>
                    {actions}
                </div>
            </div>
            <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted">
                {hint}
            </p>
            <FieldError id={errorId} message={message} />
        </fieldset>
    );
};

export default ImagePicker;
