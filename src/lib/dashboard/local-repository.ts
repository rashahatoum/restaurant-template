// Repository over the browser draft (until the Laravel API): validates like
// the API will, then saves the whole data as the draft.

import { appError, fail, ok, type Result } from "@/lib/api/errors";
import { clearDraft, currentData, saveDraft } from "@/lib/dashboard/draft-store";
import { newId } from "@/lib/dashboard/ids";
import { clearLocalImages, saveLocalImage } from "@/lib/dashboard/local-images";
import type { DashboardRepository } from "@/lib/dashboard/repository";
import { checkProductInput, checkProductQuickChanges, validateCategoryName } from "@/lib/dashboard/validation";
import type { DashboardData } from "@/types/dashboard";
import type { Category } from "@/types/menu";

/** Order 1…n in list order (no gaps after a move or a delete). */
const renumber = (categories: readonly Category[]) =>
    categories.map((category, index) => ({ ...category, order: index + 1 }));

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

    async createCategory(name) {
        const data = currentData();
        const checked = validateCategoryName(name, data.categories);
        if (!checked.ok) return checked;

        const created: Category = {
            id: newId("cat", new Set(data.categories.map((category) => category.id))),
            name: checked.data,
            order: data.categories.length + 1,
        };
        return commit({ ...data, categories: [...data.categories, created] }, created);
    },

    async renameCategory(id, name) {
        const data = currentData();
        const category = data.categories.find((candidate) => candidate.id === id);
        if (!category) return fail(appError("not_found"));

        const checked = validateCategoryName(name, data.categories, id);
        if (!checked.ok) return checked;

        const renamed = { ...category, name: checked.data };
        return commit(
            { ...data, categories: data.categories.map((candidate) => (candidate.id === id ? renamed : candidate)) },
            renamed
        );
    },

    async moveCategory(id, direction) {
        const data = currentData();
        const ordered = [...data.categories].sort((a, b) => a.order - b.order);
        const from = ordered.findIndex((category) => category.id === id);
        if (from === -1) return fail(appError("not_found"));

        const to = direction === "up" ? from - 1 : from + 1;
        if (to < 0 || to >= ordered.length) return ok(data.categories);

        [ordered[from], ordered[to]] = [ordered[to], ordered[from]];
        const categories = renumber(ordered);
        return commit({ ...data, categories }, categories);
    },

    async deleteCategory(id) {
        const data = currentData();
        if (!data.categories.some((category) => category.id === id)) return fail(appError("not_found"));

        // Same answer the API will give (409): products must move or go first
        const count = data.products.filter((product) => product.categoryId === id).length;
        if (count > 0) {
            return fail(
                appError("conflict", {
                    message: `ما فيك تحذف قسم فيه أصناف (${count}). انقلها لقسم تاني أو احذفها أول.`,
                })
            );
        }
        const categories = renumber(data.categories.filter((category) => category.id !== id));
        return commit({ ...data, categories }, null);
    },

    async setCategoryImage(id, image) {
        const data = currentData();
        const category = data.categories.find((candidate) => candidate.id === id);
        if (!category) return fail(appError("not_found"));

        // undefined drops out when the draft is saved as JSON
        const saved: Category = { ...category, image };
        return commit(
            { ...data, categories: data.categories.map((candidate) => (candidate.id === id ? saved : candidate)) },
            saved
        );
    },

    async uploadImage(image) {
        try {
            return ok({ src: await saveLocalImage(image.blob) });
        } catch {
            // Private browsing or storage full
            return fail(appError("server", { message: "المتصفح ما سمح بحفظ الصورة. جرّب من نافذة عادية (مش خاصة)." }));
        }
    },

    async resetToOriginal() {
        clearDraft();
        // The photos only the draft referred to
        await clearLocalImages();
        return ok(null);
    },
};
