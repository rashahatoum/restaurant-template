// Repository over the browser draft (until the Laravel API): validates like
// the API will, then saves the whole data as the draft.

import { appError, fail, ok, type Result } from "@/lib/api/errors";
import { clearDraft, currentData, saveDraft } from "@/lib/dashboard/draft-store";
import { newId } from "@/lib/dashboard/ids";
import { clearLocalImages, saveLocalImage } from "@/lib/dashboard/local-images";
import type { DashboardRepository } from "@/lib/dashboard/repository";
import {
    checkOfferInput,
    checkProductInput,
    checkProductQuickChanges,
    checkSectionText,
    validateCategoryName,
} from "@/lib/dashboard/validation";
import type { Offer } from "@/types/content";
import type { DashboardData } from "@/types/dashboard";
import type { Category } from "@/types/menu";

/** Order 1…n in list order (no gaps after a move or a delete). */
const renumber = (categories: readonly Category[]) =>
    categories.map((category, index) => ({ ...category, order: index + 1 }));

/** The list with the item at `from` one step up or down (unchanged at either end). */
function moveStep<T>(list: readonly T[], from: number, direction: "up" | "down"): readonly T[] {
    const to = direction === "up" ? from - 1 : from + 1;
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    [next[from], next[to]] = [next[to], next[from]];
    return next;
}

const withOffers = (data: DashboardData, offers: readonly Offer[]): DashboardData => ({
    ...data,
    offers: { ...data.offers, offers },
});

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

    async updateOffersSettings(changes) {
        const data = currentData();
        const error = checkSectionText(changes);
        if (error) return fail(error);

        // A key passed as undefined (menuCardImage) drops out when the draft is saved as JSON
        const offers = { ...data.offers, ...changes };
        const { isEnabled, eyebrow, title, menuCardImage } = offers;
        return commit({ ...data, offers }, { isEnabled, eyebrow, title, menuCardImage });
    },

    async createOffer(input) {
        const data = currentData();
        const error = checkOfferInput(input);
        if (error) return fail(error);

        // Products and offers share /menu/<id>, so the id must be free in both
        const taken = new Set([...data.products.map((product) => product.id), ...data.offers.offers.map((offer) => offer.id)]);
        const created: Offer = { ...input, id: newId("offer", taken) };
        return commit({ ...data, offers: { ...data.offers, offers: [...data.offers.offers, created] } }, created);
    },

    async saveOffer(id, input) {
        const data = currentData();
        if (!data.offers.offers.some((offer) => offer.id === id)) return fail(appError("not_found"));

        const error = checkOfferInput(input);
        if (error) return fail(error);

        const saved: Offer = { ...input, id };
        return commit(withOffers(data, data.offers.offers.map((offer) => (offer.id === id ? saved : offer))), saved);
    },

    async setOfferActive(id, isActive) {
        const data = currentData();
        const offer = data.offers.offers.find((candidate) => candidate.id === id);
        if (!offer) return fail(appError("not_found"));

        const saved = { ...offer, isActive };
        return commit(withOffers(data, data.offers.offers.map((candidate) => (candidate.id === id ? saved : candidate))), saved);
    },

    async moveOffer(id, direction) {
        const data = currentData();
        const from = data.offers.offers.findIndex((offer) => offer.id === id);
        if (from === -1) return fail(appError("not_found"));

        const offers = moveStep(data.offers.offers, from, direction);
        return commit(withOffers(data, offers), offers);
    },

    async deleteOffer(id) {
        const data = currentData();
        if (!data.offers.offers.some((offer) => offer.id === id)) return fail(appError("not_found"));
        return commit(withOffers(data, data.offers.offers.filter((offer) => offer.id !== id)), null);
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
