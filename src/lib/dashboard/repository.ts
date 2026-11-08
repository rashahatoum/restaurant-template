// The one door dashboard screens use to change data. Every method is async
// and returns a Result, never throws for expected failures, so screens handle
// "saved" and "failed" the same way whatever is behind it.
//
// Today: localRepository (browser draft). With Laravel: an apiRepository
// calling Server Actions → the API, swapped in here. Screens don't change.

import type { Result } from "@/lib/api/errors";
import type { PreparedImage } from "@/lib/dashboard/image-processing";
import { localRepository } from "@/lib/dashboard/local-repository";
import type { ProductQuickChanges } from "@/lib/dashboard/validation";
import type { AboutContent, HeroContent, MenuBanner, Offer } from "@/types/content";
import type { BannerInput, OfferInput, OffersSettings, ProductInput } from "@/types/dashboard";
import type { Category, Product } from "@/types/menu";

export interface DashboardRepository {
    /** Price, availability or best seller from the product list. Returns the saved product. */
    updateProduct(id: string, changes: ProductQuickChanges): Promise<Result<Product>>;
    /** New product from the form. Returns it with its new id. */
    createProduct(input: ProductInput): Promise<Result<Product>>;
    /** Whole product from the form. */
    saveProduct(id: string, input: ProductInput): Promise<Result<Product>>;
    deleteProduct(id: string): Promise<Result<null>>;
    /** One step earlier or later in the home "الأكثر مبيعاً" slider. Returns the best sellers in order. */
    moveBestSeller(id: string, direction: "up" | "down"): Promise<Result<readonly Product[]>>;
    /** New category, last in the order. */
    createCategory(name: string): Promise<Result<Category>>;
    renameCategory(id: string, name: string): Promise<Result<Category>>;
    /** One step up or down in the menu order. */
    moveCategory(id: string, direction: "up" | "down"): Promise<Result<readonly Category[]>>;
    /** Refused (conflict) while it still has products. */
    deleteCategory(id: string): Promise<Result<null>>;
    /** The category's card photo (full photo, cropped square); undefined removes it. */
    setCategoryImage(id: string, image: string | undefined): Promise<Result<Category>>;
    /** The offers section's switch, texts or menu card photo (only the fields passed change). */
    updateOffersSettings(changes: Partial<OffersSettings>): Promise<Result<OffersSettings>>;
    /** New offer, last in the order. */
    createOffer(input: OfferInput): Promise<Result<Offer>>;
    /** Whole offer from the form. */
    saveOffer(id: string, input: OfferInput): Promise<Result<Offer>>;
    /** On / off from the list, without the form. */
    setOfferActive(id: string, isActive: boolean): Promise<Result<Offer>>;
    /** One step up or down in the slider and the menu. */
    moveOffer(id: string, direction: "up" | "down"): Promise<Result<readonly Offer[]>>;
    deleteOffer(id: string): Promise<Result<null>>;
    /** New menu banner slide, last in the order. */
    createBanner(input: BannerInput): Promise<Result<MenuBanner>>;
    /** Whole slide from the form. */
    saveBanner(id: string, input: BannerInput): Promise<Result<MenuBanner>>;
    /** On / off from the list, without the form. */
    setBannerActive(id: string, isActive: boolean): Promise<Result<MenuBanner>>;
    /** One step earlier or later in the carousel. */
    moveBanner(id: string, direction: "up" | "down"): Promise<Result<readonly MenuBanner[]>>;
    deleteBanner(id: string): Promise<Result<null>>;
    /** The hero's texts, all together (one form). */
    saveHero(input: HeroContent): Promise<Result<HeroContent>>;
    /** «من نحن», all together (one form). */
    saveAbout(input: AboutContent): Promise<Result<AboutContent>>;
    /** Stores a prepared photo; returns the src to save on the record (a URL with the API). */
    uploadImage(image: PreparedImage): Promise<Result<{ src: string }>>;
    /** Drops every local edit (browser draft only; no-op with the API). */
    resetToOriginal(): Promise<Result<null>>;
}

export const repository: DashboardRepository = localRepository;
