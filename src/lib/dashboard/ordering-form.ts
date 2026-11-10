// The ordering form's values, pure: numbers stay text while typing, and the
// message texts show Arabic placeholders the owner can read ("{اسم الزبون}")
// while the saved settings (the API payload later) keep {restaurant} / {name}.

import { appError, fail, ok, type Result } from "@/lib/api/errors";
import { toWesternDigits } from "@/lib/digits";
import { checkOrderingInput, parsePriceInput } from "@/lib/dashboard/validation";
import type { SiteInfo } from "@/types/content";
import type { OrderingSettings } from "@/types/order";

/** What the owner sees ↔ what's saved. */
export const PLACEHOLDERS = [
    { label: "اسم المطعم", shown: "{اسم المطعم}", saved: "{restaurant}" },
    { label: "اسم الزبون", shown: "{اسم الزبون}", saved: "{name}" },
] as const;

const swap = (text: string, from: "shown" | "saved", to: "shown" | "saved") =>
    PLACEHOLDERS.reduce((result, placeholder) => result.replaceAll(placeholder[from], placeholder[to]), text);

export const toShownText = (text: string) => swap(text, "saved", "shown");
export const toSavedText = (text: string) => swap(text, "shown", "saved");

export interface BranchTablesValues {
    branchId: string;
    isEnabled: boolean;
    /** As typed; empty while off. */
    tableCount: string;
}

export interface OrderingFormValues {
    deliveryEnabled: boolean;
    /** As typed. */
    fee: string;
    phoneId: string;
    dineInEnabled: boolean;
    /** One per branch of the restaurant info, in its order. */
    branches: BranchTablesValues[];
    greeting: string;
    closing: string;
    thankYou: string;
}

export function toOrderingFormValues(ordering: OrderingSettings, info: Pick<SiteInfo, "branches">): OrderingFormValues {
    return {
        deliveryEnabled: ordering.delivery.isEnabled,
        fee: String(ordering.delivery.fee),
        phoneId: ordering.delivery.phoneId,
        dineInEnabled: ordering.dineIn.isEnabled,
        // A branch added in the info page has no setting yet: off
        branches: info.branches.map((branch) => {
            const setting = ordering.dineIn.branches.find((candidate) => candidate.branchId === branch.id);
            return {
                branchId: branch.id,
                isEnabled: setting?.isEnabled ?? false,
                tableCount: setting?.tableCount ? String(setting.tableCount) : "",
            };
        }),
        greeting: toShownText(ordering.message.greeting),
        closing: toShownText(ordering.message.closing),
        thankYou: toShownText(ordering.thankYou),
    };
}

/** "١٢" → 12, "" → 0 (no tables yet); null when it isn't a whole number. */
function parseTableCount(text: string): number | null {
    const typed = toWesternDigits(text).trim();
    if (!typed) return 0;
    return /^\d+$/.test(typed) ? Number(typed) : null;
}

const toSettings = (values: OrderingFormValues, fee: number, tableCounts: readonly number[]): OrderingSettings => ({
    delivery: { isEnabled: values.deliveryEnabled, fee, phoneId: values.phoneId },
    dineIn: {
        isEnabled: values.dineInEnabled,
        branches: values.branches.map((branch, index) => ({
            branchId: branch.branchId,
            isEnabled: branch.isEnabled,
            tableCount: tableCounts[index],
        })),
    },
    message: { greeting: toSavedText(values.greeting).trim(), closing: toSavedText(values.closing).trim() },
    thankYou: toSavedText(values.thankYou).trim(),
});

/** For the live preview: numbers that can't be read count as 0. */
export const toOrderingDraft = (values: OrderingFormValues) =>
    toSettings(
        values,
        parsePriceInput(values.fee) ?? 0,
        values.branches.map((branch) => parseTableCount(branch.tableCount) ?? 0)
    );

/**
 * Text → settings. Numbers that can't be read fail here, together with the
 * other fields' problems; readable settings are checked again by the repository.
 */
export function parseOrderingForm(values: OrderingFormValues, info: Pick<SiteInfo, "phones" | "branches">): Result<OrderingSettings> {
    const fee = parsePriceInput(values.fee);
    const tableCounts = values.branches.map((branch) => parseTableCount(branch.tableCount));
    const settings = toSettings(values, fee ?? 0, tableCounts.map((count) => count ?? 0));
    const errors: Record<string, string[]> = { ...(checkOrderingInput(settings, info)?.fieldErrors ?? {}) };

    if (fee === null) errors["delivery.fee"] = ["اكتب رسوم التوصيل رقم، متل 150 (أو 0 إذا مجاني)"];
    tableCounts.forEach((count, index) => {
        if (count === null) errors[`dineIn.branches.${index}.tableCount`] = ["عدد الطاولات رقم، متل 10"];
    });

    return Object.keys(errors).length > 0 ? fail(appError("validation", { fieldErrors: errors })) : ok(settings);
}
