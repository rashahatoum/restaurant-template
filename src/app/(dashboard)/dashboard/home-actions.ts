"use server";

// The dashboard's hero and «من نحن» writes with the Laravel API (D7g): each is
// one whole record (PUT, API-CONTRACT §4). Called by lib/dashboard/api-repository
// only; same rules as menu-actions.

import type { Result } from "@/lib/api/errors";
import { adminWrite, badRequest, isObject } from "@/lib/dashboard/action-helpers";
import { HOME_TAG } from "@/services/content";
import type { AboutContent, HeroContent } from "@/types/content";

/** The hero's texts, all together (PUT: a missing badge is cleared). */
export async function saveHeroAction(input: HeroContent): Promise<Result<HeroContent>> {
    if (!isObject(input)) return badRequest();
    return adminWrite(HOME_TAG, "/admin/hero", { method: "PUT", body: input });
}

/** «من نحن», all together (PUT: a missing badge is cleared). */
export async function saveAboutAction(input: AboutContent): Promise<Result<AboutContent>> {
    if (!isObject(input)) return badRequest();
    return adminWrite(HOME_TAG, "/admin/about", { method: "PUT", body: input });
}
