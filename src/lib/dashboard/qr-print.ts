// What the QR print page prints, carried in its link. Until the API exists the
// branches and table counts live in the browser draft, so the list sends them
// (branch name included); with Laravel the page reads them itself and only
// the branch id and the range stay in the link.

import { SITE_INFO_LIMITS } from "@/lib/dashboard/validation";
import { MAX_TABLES } from "@/lib/table-session";

export const QR_PRINT_PATH = "/dashboard/qr/print";

export type QrPrintRequest =
    | { kind: "menu" }
    | { kind: "tables"; branchId: string; branchName: string; from: number; to: number };

export function qrPrintPath(request: QrPrintRequest): string {
    if (request.kind === "menu") return `${QR_PRINT_PATH}?kind=menu`;
    const params = new URLSearchParams({
        kind: "tables",
        branch: request.branchId,
        name: request.branchName,
        from: String(request.from),
        to: String(request.to),
    });
    return `${QR_PRINT_PATH}?${params}`;
}

/** A table range is fine: whole numbers, 1 ≤ from ≤ to ≤ MAX_TABLES. */
export const isTableRange = (from: number, to: number) =>
    Number.isInteger(from) && Number.isInteger(to) && from >= 1 && from <= to && to <= MAX_TABLES;

/** The page's search params → what to print; null when the link is broken or edited by hand. */
export function parseQrPrint(params: Record<string, string | string[] | undefined>): QrPrintRequest | null {
    const one = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");
    if (one("kind") === "menu") return { kind: "menu" };
    if (one("kind") !== "tables") return null;

    const branchId = one("branch");
    const branchName = one("name").trim();
    const from = Number(one("from"));
    const to = Number(one("to"));
    const isValid =
        /^[\w-]{1,64}$/.test(branchId) && branchName.length > 0 && branchName.length <= SITE_INFO_LIMITS.branchName && isTableRange(from, to);
    return isValid ? { kind: "tables", branchId, branchName, from, to } : null;
}
