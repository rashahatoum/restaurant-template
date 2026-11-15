"use server";

// Dashboard photo uploads with the Laravel API (D7c, shared by every live
// area: menu, offers…). Called by lib/dashboard/api-repository only.

import { apiFetch } from "@/lib/api/client";
import { appError, fail, ok, type Result } from "@/lib/api/errors";
import { badRequest } from "@/lib/dashboard/action-helpers";

interface UploadResponse {
    url: string;
    width: number;
    height: number;
}

/**
 * A prepared photo (FormData field `image`) → `POST /admin/uploads`. Changes
 * no record, so nothing to refresh: the form saves the returned URL later.
 */
export async function uploadImageAction(formData: FormData): Promise<Result<{ src: string }>> {
    const image = formData.get("image");
    if (!(image instanceof File)) return badRequest();

    const body = new FormData();
    body.append("image", image);
    const result = await apiFetch<UploadResponse>("/admin/uploads", { method: "POST", body, auth: true });
    if (!result.ok) return result;
    return typeof result.data?.url === "string" ? ok({ src: result.data.url }) : fail(appError("server"));
}
