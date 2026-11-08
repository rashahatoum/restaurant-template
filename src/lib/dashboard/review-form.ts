// The review form's values, pure: what the fields hold, the input the
// repository saves, and the clock ↔ display time conversion.

import type { Review } from "@/types/content";
import type { ReviewInput } from "@/types/dashboard";

/* =========================
   TIME
   Stored as shown on the card ("9:41 م"); picked in the form with a native
   clock (<input type="time">, "21:41").
========================= */

const AM = "ص";
const PM = "م";

/** "21:41" → "9:41 م", "00:05" → "12:05 ص". Empty when there's no time. */
export function fromClockValue(value: string): string {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (!match) return "";
    const hours = Number(match[1]);
    return `${hours % 12 || 12}:${match[2]} ${hours < 12 ? AM : PM}`;
}

/** "9:41 م" → "21:41", for the clock field. Empty when the text isn't a time like that. */
export function toClockValue(time: string | undefined): string {
    const match = /^(\d{1,2}):(\d{2})\s*([صم])$/.exec(time?.trim() ?? "");
    if (!match) return "";
    const hours = (Number(match[1]) % 12) + (match[3] === PM ? 12 : 0);
    return `${String(hours).padStart(2, "0")}:${match[2]}`;
}

/* =========================
   FORM
========================= */

export interface ReviewFormValues {
    customerName: string;
    question: string;
    answer: string;
    /** "HH:MM" from the clock field, or empty. */
    clock: string;
    isVisible: boolean;
}

export const toReviewFormValues = (review?: Review): ReviewFormValues => ({
    customerName: review?.customerName ?? "",
    question: review?.question ?? "",
    answer: review?.answer ?? "",
    clock: toClockValue(review?.time),
    isVisible: review?.isVisible ?? true,
});

/**
 * The input to save. An empty question falls back to the section's default
 * one on the site. `saved` keeps a time the clock can't show (typed by hand
 * in old data) while the field is untouched.
 */
export function toReviewInput(values: ReviewFormValues, saved?: Review): ReviewInput {
    const question = values.question.trim();
    const time = values.clock ? fromClockValue(values.clock) : toClockValue(saved?.time) ? "" : (saved?.time ?? "");
    return {
        customerName: values.customerName.trim(),
        ...(question ? { question } : {}),
        answer: values.answer.trim(),
        ...(time ? { time } : {}),
        isVisible: values.isVisible,
    };
}

export const isSameReviewForm = (a: ReviewFormValues, b: ReviewFormValues) =>
    (Object.keys(a) as (keyof ReviewFormValues)[]).every((key) => a[key] === b[key]);
