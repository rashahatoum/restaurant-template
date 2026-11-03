// Repository over the browser draft (until the Laravel API): validates like
// the API will, then saves the whole data as the draft.

import { appError, fail, ok } from "@/lib/api/errors";
import { clearDraft, currentData, saveDraft } from "@/lib/dashboard/draft-store";
import type { DashboardRepository } from "@/lib/dashboard/repository";
import { checkProductQuickChanges } from "@/lib/dashboard/validation";

export const localRepository: DashboardRepository = {
    async updateProduct(id, changes) {
        const data = currentData();
        const product = data.products.find((candidate) => candidate.id === id);
        if (!product) return fail(appError("not_found"));

        const error = checkProductQuickChanges(product, changes);
        if (error) return fail(error);

        const saved = { ...product, ...changes };
        const isStored = saveDraft({
            ...data,
            products: data.products.map((candidate) => (candidate.id === id ? saved : candidate)),
        });

        // Applied on screen either way; say so if it won't survive a reload
        return isStored
            ? ok(saved)
            : fail(appError("server", { message: "المتصفح ما سمح بالحفظ، التعديل رح يروح إذا حدّثت الصفحة" }));
    },

    async resetToOriginal() {
        clearDraft();
        return ok(null);
    },
};
