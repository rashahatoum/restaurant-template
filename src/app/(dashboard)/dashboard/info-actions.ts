"use server";

// The dashboard's restaurant info write with the Laravel API (D7h): one whole
// record (PUT /admin/site-info, API-CONTRACT §4). New phones and branches go
// with `id: ""` (the API gives them ids, §4.1). The API refuses (409) a save
// that would leave delivery or a branch with tables without a WhatsApp number.
// Refreshes the public site info and ordering (numbers and branches feed both).

import type { Result } from "@/lib/api/errors";
import { adminWrite, badRequest, isObject } from "@/lib/dashboard/action-helpers";
import { SITE_INFO_TAG } from "@/services/content";
import { ORDERING_TAG } from "@/services/ordering";
import type { SiteInfo } from "@/types/content";

export async function saveSiteInfoAction(input: SiteInfo): Promise<Result<SiteInfo>> {
    if (!isObject(input) || !Array.isArray(input.phones) || !Array.isArray(input.branches)) return badRequest();
    return adminWrite([SITE_INFO_TAG, ORDERING_TAG], "/admin/site-info", { method: "PUT", body: input });
}
