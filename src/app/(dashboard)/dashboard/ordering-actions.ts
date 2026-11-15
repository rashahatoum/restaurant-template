"use server";

// The dashboard's ordering write with the Laravel API (D7i): one whole record
// (PUT /admin/ordering, API-CONTRACT §4). The API checks it against the saved
// restaurant info (what's on needs a WhatsApp number). Called by
// lib/dashboard/api-repository only.

import type { Result } from "@/lib/api/errors";
import { adminWrite, badRequest, isObject } from "@/lib/dashboard/action-helpers";
import { ORDERING_TAG } from "@/services/ordering";
import type { OrderingSettings } from "@/types/order";

export async function saveOrderingAction(input: OrderingSettings): Promise<Result<OrderingSettings>> {
    if (!isObject(input) || !isObject(input.delivery) || !isObject(input.dineIn)) return badRequest();
    return adminWrite(ORDERING_TAG, "/admin/ordering", { method: "PUT", body: input });
}
