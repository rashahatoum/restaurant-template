// The dashboard's menu methods with the Laravel API (D7c): each one calls a
// Server Action (menu-actions), which calls the API with the user's token.
// Screens see the same Result as with the browser draft. Only the menu area:
// the other methods stay on localRepository until the API has them.

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
    uploadMenuImageAction,
} from "@/app/(dashboard)/dashboard/menu-actions";
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

type MenuMethods =
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

export const apiMenuRepository: Pick<DashboardRepository, MenuMethods> & {
    uploadMenuImage(image: PreparedImage): Promise<Result<{ src: string }>>;
} = {
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
    uploadMenuImage: (image) => {
        const formData = new FormData();
        formData.append("image", image.blob, fileName(image.blob));
        return signedIn(() => uploadMenuImageAction(formData));
    },
};
