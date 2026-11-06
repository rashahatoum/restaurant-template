// Repository over the browser draft (until the Laravel API): validates like
// the API will, then saves the whole data as the draft.

import { appError, fail, ok, type Result } from "@/lib/api/errors";
import { clearDraft, currentData, saveDraft } from "@/lib/dashboard/draft-store";
import { newId } from "@/lib/dashboard/ids";
import type { DashboardRepository } from "@/lib/dashboard/repository";
import { checkProductInput, checkProductQuickChanges } from "@/lib/dashboard/validation";
import type { DashboardData } from "@/types/dashboard";

/** Saves the draft; the change shows on screen either way, but say so if it won't survive a reload. */
function commit<T>(next: DashboardData, data: T): Result<T> {
    return saveDraft(next)
        ? ok(data)
        : fail(appError("server", { message: "المتصفح ما سمح بالحفظ، التعديل رح يروح إذا حدّثت الصفحة" }));
}

export const localRepository: DashboardRepository = {
    async updateProduct(id, changes) {
        const data = currentData();
        const product = data.products.find((candidate) => candidate.id === id);
        if (!product) return fail(appError("not_found"));

        const error = checkProductQuickChanges(product, changes);
        if (error) return fail(error);

        const saved = { ...product, ...changes };
        return commit(
            { ...data, products: data.products.map((candidate) => (candidate.id === id ? saved : candidate)) },
            saved
        );
    },

    async createProduct(input) {
        const data = currentData();
        const error = checkProductInput(input, data.categories);
        if (error) return fail(error);

        // Products and offers share /menu/<id>, so the id must be free in both
        const taken = new Set([...data.products.map((product) => product.id), ...data.offers.offers.map((offer) => offer.id)]);
        const created = { ...input, id: newId("item", taken) };
        return commit({ ...data, products: [...data.products, created] }, created);
    },

    async saveProduct(id, input) {
        const data = currentData();
        if (!data.products.some((product) => product.id === id)) return fail(appError("not_found"));

        const error = checkProductInput(input, data.categories);
        if (error) return fail(error);

        const saved = { ...input, id };
        return commit(
            { ...data, products: data.products.map((product) => (product.id === id ? saved : product)) },
            saved
        );
    },

    async deleteProduct(id) {
        const data = currentData();
        if (!data.products.some((product) => product.id === id)) return fail(appError("not_found"));
        return commit({ ...data, products: data.products.filter((product) => product.id !== id) }, null);
    },

    async resetToOriginal() {
        clearDraft();
        return ok(null);
    },
};
