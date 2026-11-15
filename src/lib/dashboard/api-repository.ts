// The dashboard's methods with the Laravel API, for the areas that are live:
// the menu (D7c), offers (D7d), banners (D7e), reviews (D7f), hero + about (D7g), site info (D7h). Each calls a Server Action, which calls the
// API with the user's token. Screens see the same Result as with the browser
// draft. Other areas stay on localRepository until the API has them.

import {
    createCategoryAction,
    createProductAction,
    deleteCategoryAction,
    deleteProductAction,
    moveBestSellerAction,
    moveCategoryAction,
    renameCategoryAction,
    saveProductAction,
    setCategoryImageAction,
    updateProductAction,
} from "@/app/(dashboard)/dashboard/menu-actions";
import { saveAboutAction, saveHeroAction } from "@/app/(dashboard)/dashboard/home-actions";
import { saveSiteInfoAction } from "@/app/(dashboard)/dashboard/info-actions";
import {
    createOfferAction,
    deleteOfferAction,
    moveOfferAction,
    saveOfferAction,
    setOfferActiveAction,
    updateOffersSettingsAction,
} from "@/app/(dashboard)/dashboard/offers-actions";
import {
    createBannerAction,
    deleteBannerAction,
    moveBannerAction,
    saveBannerAction,
    setBannerActiveAction,
} from "@/app/(dashboard)/dashboard/banners-actions";
import {
    createReviewAction,
    deleteReviewAction,
    moveReviewAction,
    saveReviewAction,
    setReviewVisibleAction,
    updateReviewsSettingsAction,
} from "@/app/(dashboard)/dashboard/reviews-actions";
import { uploadImageAction } from "@/app/(dashboard)/dashboard/upload-actions";
import { appError, fail, type Result } from "@/lib/api/errors";
import { sessionExpiredHref } from "@/lib/auth/paths";
import type { PreparedImage } from "@/lib/dashboard/image-processing";
import type { DashboardRepository } from "@/lib/dashboard/repository";

/**
 * Every call goes through here, so screens don't handle these themselves:
 * - the Server Action call itself failed (the phone lost its connection, or a
 *   body over the size limit): a Result like any other, never a thrown error;
 * - the login ended on the server (token expired or revoked): sign in again
 *   and come back to this page.
 */
async function signedIn<T>(call: () => Promise<Result<T>>): Promise<Result<T>> {
    let result: Result<T>;
    try {
        result = await call();
    } catch {
        return fail(appError(navigator.onLine ? "server" : "offline"));
    }
    if (!result.ok && result.error.kind === "unauthenticated") {
        window.location.assign(sessionExpiredHref(`${window.location.pathname}${window.location.search}`));
    }
    return result;
}

/** File name for the upload: the type the browser could encode (WebP, or PNG/JPG on Safari). */
const fileName = (blob: Blob) => `photo.${blob.type.split("/")[1] ?? "webp"}`;

export type MenuMethods =
    | "updateProduct"
    | "createProduct"
    | "saveProduct"
    | "deleteProduct"
    | "moveBestSeller"
    | "createCategory"
    | "renameCategory"
    | "moveCategory"
    | "deleteCategory"
    | "setCategoryImage";

export type OffersMethods = "updateOffersSettings" | "createOffer" | "saveOffer" | "setOfferActive" | "moveOffer" | "deleteOffer";

export const apiMenuRepository: Pick<DashboardRepository, MenuMethods> = {
    updateProduct: (id, changes) => signedIn(() => updateProductAction(id, changes)),
    createProduct: (input) => signedIn(() => createProductAction(input)),
    saveProduct: (id, input) => signedIn(() => saveProductAction(id, input)),
    deleteProduct: (id) => signedIn(() => deleteProductAction(id)),
    moveBestSeller: (id, direction) => signedIn(() => moveBestSellerAction(id, direction)),
    createCategory: (name) => signedIn(() => createCategoryAction(name)),
    renameCategory: (id, name) => signedIn(() => renameCategoryAction(id, name)),
    moveCategory: (id, direction) => signedIn(() => moveCategoryAction(id, direction)),
    deleteCategory: (id) => signedIn(() => deleteCategoryAction(id)),
    setCategoryImage: (id, image) => signedIn(() => setCategoryImageAction(id, image)),
};

export const apiOffersRepository: Pick<DashboardRepository, OffersMethods> = {
    updateOffersSettings: (changes) => signedIn(() => updateOffersSettingsAction(changes)),
    createOffer: (input) => signedIn(() => createOfferAction(input)),
    saveOffer: (id, input) => signedIn(() => saveOfferAction(id, input)),
    setOfferActive: (id, isActive) => signedIn(() => setOfferActiveAction(id, isActive)),
    moveOffer: (id, direction) => signedIn(() => moveOfferAction(id, direction)),
    deleteOffer: (id) => signedIn(() => deleteOfferAction(id)),
};

export type BannersMethods = "createBanner" | "saveBanner" | "setBannerActive" | "moveBanner" | "deleteBanner";

export const apiBannersRepository: Pick<DashboardRepository, BannersMethods> = {
    createBanner: (input) => signedIn(() => createBannerAction(input)),
    saveBanner: (id, input) => signedIn(() => saveBannerAction(id, input)),
    setBannerActive: (id, isActive) => signedIn(() => setBannerActiveAction(id, isActive)),
    moveBanner: (id, direction) => signedIn(() => moveBannerAction(id, direction)),
    deleteBanner: (id) => signedIn(() => deleteBannerAction(id)),
};

export type ReviewsMethods = "updateReviewsSettings" | "createReview" | "saveReview" | "setReviewVisible" | "moveReview" | "deleteReview";

export const apiReviewsRepository: Pick<DashboardRepository, ReviewsMethods> = {
    updateReviewsSettings: (changes) => signedIn(() => updateReviewsSettingsAction(changes)),
    createReview: (input) => signedIn(() => createReviewAction(input)),
    saveReview: (id, input) => signedIn(() => saveReviewAction(id, input)),
    setReviewVisible: (id, isVisible) => signedIn(() => setReviewVisibleAction(id, isVisible)),
    moveReview: (id, direction) => signedIn(() => moveReviewAction(id, direction)),
    deleteReview: (id) => signedIn(() => deleteReviewAction(id)),
};

export const apiHomeRepository: Pick<DashboardRepository, "saveHero" | "saveAbout"> = {
    saveHero: (input) => signedIn(() => saveHeroAction(input)),
    saveAbout: (input) => signedIn(() => saveAboutAction(input)),
};

export const apiInfoRepository: Pick<DashboardRepository, "saveSiteInfo"> = {
    saveSiteInfo: (input) => signedIn(() => saveSiteInfoAction(input)),
};

/** A prepared photo → the API's uploads (any live area). */
export function uploadImageToApi(image: PreparedImage): Promise<Result<{ src: string }>> {
    const formData = new FormData();
    formData.append("image", image.blob, fileName(image.blob));
    return signedIn(() => uploadImageAction(formData));
}
