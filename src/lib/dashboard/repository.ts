// The one door dashboard screens use to change data. Every method is async
// and returns a Result, never throws for expected failures, so screens handle
// "saved" and "failed" the same way whatever is behind it.
//
// Today: localRepository (browser draft). With Laravel: an apiRepository
// calling Server Actions → the API, swapped in here. Screens don't change.

import type { Result } from "@/lib/api/errors";
import { localRepository } from "@/lib/dashboard/local-repository";
import type { ProductQuickChanges } from "@/lib/dashboard/validation";
import type { ProductInput } from "@/types/dashboard";
import type { Product } from "@/types/menu";

export interface DashboardRepository {
    /** Price, availability or best seller from the product list. Returns the saved product. */
    updateProduct(id: string, changes: ProductQuickChanges): Promise<Result<Product>>;
    /** New product from the form. Returns it with its new id. */
    createProduct(input: ProductInput): Promise<Result<Product>>;
    /** Whole product from the form. */
    saveProduct(id: string, input: ProductInput): Promise<Result<Product>>;
    deleteProduct(id: string): Promise<Result<null>>;
    /** Drops every local edit (browser draft only; no-op with the API). */
    resetToOriginal(): Promise<Result<null>>;
}

export const repository: DashboardRepository = localRepository;
