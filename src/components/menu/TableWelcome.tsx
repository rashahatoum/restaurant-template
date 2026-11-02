"use client";

import { tableSessionActions, useTableSession } from "@/hooks/useTableSession";
import { BRANCH_PARAM, resolveTable, TABLE_PARAM, tableFromSearch } from "@/lib/table-session";
import type { OrderingOptions } from "@/types/order";
import { useEffect } from "react";
import { FiMapPin, FiX } from "react-icons/fi";

interface TableWelcomeProps {
    dineInBranches: OrderingOptions["dineInBranches"];
}

// On the menu: picks up a table QR link (?branch=…&table=…), remembers it
// (useTableSession) and drops it from the address bar, so a shared menu link
// doesn't carry someone's table. Then greets the customer with their table.
// Read in an effect, not via searchParams, so /menu stays a static page.
const TableWelcome = ({ dineInBranches }: TableWelcomeProps) => {
    const session = useTableSession();
    const resolved = resolveTable(session, dineInBranches);

    useEffect(() => {
        const { search, hash, pathname } = window.location;
        const params = new URLSearchParams(search);
        if (!params.has(BRANCH_PARAM) && !params.has(TABLE_PARAM)) return;

        const scanned = tableFromSearch(search, dineInBranches, Date.now());
        if (scanned) tableSessionActions.set(scanned);

        params.delete(BRANCH_PARAM);
        params.delete(TABLE_PARAM);
        const rest = params.toString();
        // Next.js keeps its router in sync with native replaceState
        window.history.replaceState(null, "", `${pathname}${rest ? `?${rest}` : ""}${hash}`);
    }, [dineInBranches]);

    if (!resolved) return null;

    return (
        <div
            role="status"
            className="mt-12 flex items-center gap-10 rounded-full border border-primary/30 bg-primary/10 py-6 ps-14 pe-6 text-sm"
        >
            <FiMapPin aria-hidden="true" className="shrink-0 text-primary" />
            <p className="flex-1">
                أهلاً فيك! انت على <strong className="text-primary">طاولة {resolved.table}</strong> · {resolved.branch.name}
            </p>
            <button
                type="button"
                onClick={tableSessionActions.clear}
                aria-label="مش عالطاولة؟ إلغاء الطاولة"
                className="flex size-32 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-primary/15 hover:text-primary"
            >
                <FiX aria-hidden="true" />
            </button>
        </div>
    );
};

export default TableWelcome;
