// Table QR codes: /menu?branch=<branchId>&table=<n> tells the site which
// table the customer sits at, so checkout can pre-fill it. The printed codes
// hold a short link (/t/<branchId>/<n>) that next.config redirects there, so
// the menu link can change without reprinting. Pure helpers; the browser
// store lives in hooks/useTableSession.

import type { OrderingOptions } from "@/types/order";

/** How long the site remembers the table: about one restaurant visit. */
export const TABLE_SESSION_HOURS = 3;

export interface TableSession {
    branchId: string;
    table: number;
    /** Epoch ms. */
    expiresAt: number;
}

export const BRANCH_PARAM = "branch";
export const TABLE_PARAM = "table";

/** The link printed in a table's QR code (redirects to the menu with the table). */
export function tableShortPath(branchId: string, table: number): string {
    return `/t/${encodeURIComponent(branchId)}/${table}`;
}

/** The most tables a branch can have (dashboard rule and print range). */
export const MAX_TABLES = 99;

/** The branch and table a session points to, or null if they no longer exist. */
export function resolveTable(
    session: Pick<TableSession, "branchId" | "table"> | null,
    branches: OrderingOptions["dineInBranches"]
) {
    if (!session) return null;
    const branch = branches.find((candidate) => candidate.id === session.branchId);
    if (!branch || !Number.isInteger(session.table) || session.table < 1 || session.table > branch.tableCount) {
        return null;
    }
    return { branch, table: session.table };
}

/** From a QR link's query string; null when it has no valid table. */
export function tableFromSearch(
    search: string,
    branches: OrderingOptions["dineInBranches"],
    now: number
): TableSession | null {
    const params = new URLSearchParams(search);
    const branchId = params.get(BRANCH_PARAM);
    const table = Number(params.get(TABLE_PARAM));
    if (!branchId) return null;

    return resolveTable({ branchId, table }, branches)
        ? { branchId, table, expiresAt: now + TABLE_SESSION_HOURS * 60 * 60 * 1000 }
        : null;
}

/** Validates what came back from storage. */
export function parseTableSession(value: unknown, now: number): TableSession | null {
    if (typeof value !== "object" || value === null) return null;
    const { branchId, table, expiresAt } = value as Record<string, unknown>;
    if (typeof branchId !== "string" || typeof table !== "number" || typeof expiresAt !== "number") return null;
    return expiresAt > now ? { branchId, table, expiresAt } : null;
}
