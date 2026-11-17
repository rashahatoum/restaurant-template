// Ordering settings, as the checkout needs them: only enabled order types and
// branches, branch names and WhatsApp numbers resolved (delivery: the chosen
// phone; tables: the branch's own WhatsApp phone).
//
// With the API (D7i): `GET /ordering` does this on the server, which has the
// branch staff phones (the public site info leaves them out). Without it: the
// same rules here, over the mock data.

import { restaurantConfig } from "@/config/restaurant";
import { ordering } from "@/data/mock/ordering";
import { siteInfo } from "@/data/mock/site-info";
import { apiFetch } from "@/lib/api/client";
import { isAreaLive } from "@/lib/api/config";
import { branchWhatsApp } from "@/lib/site-info";
import type { OrderingOptions } from "@/types/order";
import { cache } from "react";

/** Cache tag of the public ordering read; a site-info save refreshes it too (numbers, branches). */
export const ORDERING_TAG = "ordering";

/** Fallback refresh, for changes made on the server without the dashboard (API-CONTRACT §3). */
const ORDERING_REVALIDATE_SECONDS = 60 * 60;

/** What the API resolves; the two settings from the config are added here. */
type ResolvedOrdering = Omit<OrderingOptions, "restaurantName" | "timeZone">;

/** The same rules as the API, over the mock data (no API). */
function mockOrdering(): ResolvedOrdering {
    const { branches, phones } = siteInfo;
    const { delivery, dineIn, message, thankYou } = ordering;

    const dineInBranches = dineIn.isEnabled
        ? dineIn.branches.flatMap((setting) => {
              const branch = branches.find((candidate) => candidate.id === setting.branchId);
              const phone = branch && branchWhatsApp(phones, branch.id);
              return branch && phone && setting.isEnabled && setting.tableCount > 0
                  ? [{ id: branch.id, name: branch.name, tableCount: setting.tableCount, whatsApp: phone.number }]
                  : [];
          })
        : [];

    // Off as well when its phone is gone or has no WhatsApp (orders couldn't be sent)
    const deliveryPhone = phones.find((phone) => phone.id === delivery.phoneId && phone.hasWhatsApp);

    return {
        delivery: delivery.isEnabled && deliveryPhone ? { fee: delivery.fee, whatsApp: deliveryPhone.number } : null,
        dineInBranches,
        message,
        thankYou,
    };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * `GET /ordering` → our shape: `{ delivery: { fee, whatsApp } | null,
 * dineInBranches, message, thankYou }` (API-CONTRACT §3, confirmed and seen on
 * staging). Anything else fails loudly.
 */
function toResolvedOrdering(raw: unknown): ResolvedOrdering {
    if (!isObject(raw) || !isObject(raw.message) || typeof raw.thankYou !== "string") {
        throw new Error("GET /ordering: expected delivery, dineInBranches, message and thankYou (API-CONTRACT §3)");
    }
    const dineIn = raw.dineInBranches;
    if (!Array.isArray(dineIn)) throw new Error("GET /ordering: no dineInBranches list (API-CONTRACT §3)");
    const delivery = isObject(raw.delivery) && typeof raw.delivery.fee === "number" && typeof raw.delivery.whatsApp === "string" ? raw.delivery : null;

    return {
        delivery: delivery ? { fee: delivery.fee as number, whatsApp: delivery.whatsApp as string } : null,
        dineInBranches: dineIn as OrderingOptions["dineInBranches"],
        message: raw.message as unknown as OrderingOptions["message"],
        thankYou: raw.thankYou,
    };
}

/** Once per render (the menu and the cart read it); with the API, cached with its tag; throws when it fails. */
export const getOrderingOptions = cache(async (): Promise<OrderingOptions> => {
    let resolved: ResolvedOrdering;
    if (!isAreaLive("ordering")) {
        resolved = mockOrdering();
    } else {
        const result = await apiFetch<unknown>("/ordering", { next: { tags: [ORDERING_TAG], revalidate: ORDERING_REVALIDATE_SECONDS } });
        if (!result.ok) throw new Error(`GET /ordering failed (${result.error.kind}${result.error.status ? ` ${result.error.status}` : ""})`);
        resolved = toResolvedOrdering(result.data);
    }

    return { ...resolved, restaurantName: restaurantConfig.name, timeZone: restaurantConfig.timeZone };
});
