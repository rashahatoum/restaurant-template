// The one door dashboard screens use to change data. Every method is async
// and returns a Result, never throws for expected failures, so screens handle
// "saved" and "failed" the same way whatever is behind it.
//
// localRepository: the browser draft. apiMenuRepository: Server Actions →
// the Laravel API, for the menu area only (D7c), used when the server says the
// menu is live (API_BASE_URL set). Every other area stays on the draft until
// the API has it. Screens don't change.

import type { Result } from "@/lib/api/errors";
import { apiMenuRepository } from "@/lib/dashboard/api-repository";
import { isMenuLive } from "@/lib/dashboard/draft-store";
import type { PreparedImage } from "@/lib/dashboard/image-processing";
import { localRepository } from "@/lib/dashboard/local-repository";
import type { ProductQuickChanges } from "@/lib/dashboard/validation";
import type { AboutContent, HeroContent, MenuBanner, Offer, Review, SiteInfo } from "@/types/content";
import type { BannerInput, OfferInput, OffersSettings, ProductInput, ReviewInput, ReviewsSettings } from "@/types/dashboard";
import type { Category, Product } from "@/types/menu";
import type { OrderingSettings } from "@/types/order";

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
    /** The reviews section's switch or texts (only the fields passed change). */
    updateReviewsSettings(changes: Partial<ReviewsSettings>): Promise<Result<ReviewsSettings>>;
    /** New review, last in the slider. */
    createReview(input: ReviewInput): Promise<Result<Review>>;
    /** Whole review from the form. */
    saveReview(id: string, input: ReviewInput): Promise<Result<Review>>;
    /** Shown / hidden from the list, without the form. */
    setReviewVisible(id: string, isVisible: boolean): Promise<Result<Review>>;
    /** One step earlier or later in the slider. */
    moveReview(id: string, direction: "up" | "down"): Promise<Result<readonly Review[]>>;
    deleteReview(id: string): Promise<Result<null>>;
    /**
     * Restaurant info, all together (one form). New phones / branches come
     * with an empty id. A deleted branch's tables and staff numbers go with it. Refused (conflict) when delivery or a branch with tables
     * would be left without a WhatsApp number.
     */
    saveSiteInfo(input: SiteInfo): Promise<Result<SiteInfo>>;
    /**
     * Delivery, tables and message texts, all together (one form). Checked
     * against the saved restaurant info: what's on needs a WhatsApp number.
     */
    saveOrdering(input: OrderingSettings): Promise<Result<OrderingSettings>>;
    /** The hero's texts, all together (one form). */
    saveHero(input: HeroContent): Promise<Result<HeroContent>>;
    /** «من نحن», all together (one form). */
    saveAbout(input: AboutContent): Promise<Result<AboutContent>>;
    /**
     * Stores a prepared photo; returns the src to save on the record.
     * `area: "menu"` (products, category cards) → the API's uploads when the
     * menu is live. Other areas keep their photos in this browser: the API
     * deletes an upload that no API record uses after 24 h.
     */
    uploadImage(image: PreparedImage, area?: "menu"): Promise<Result<{ src: string }>>;
    /** Drops every local edit (browser draft only; the menu on the server isn't touched). */
    resetToOriginal(): Promise<Result<null>>;
}

/** The API when the menu is live, else the browser draft (checked on every call). */
const menu = () => (isMenuLive() ? apiMenuRepository : localRepository);

export const repository: DashboardRepository = {
    ...localRepository,
    updateProduct: (id, changes) => menu().updateProduct(id, changes),
    createProduct: (input) => menu().createProduct(input),
    saveProduct: (id, input) => menu().saveProduct(id, input),
    deleteProduct: (id) => menu().deleteProduct(id),
    moveBestSeller: (id, direction) => menu().moveBestSeller(id, direction),
    createCategory: (name) => menu().createCategory(name),
    renameCategory: (id, name) => menu().renameCategory(id, name),
    moveCategory: (id, direction) => menu().moveCategory(id, direction),
    deleteCategory: (id) => menu().deleteCategory(id),
    setCategoryImage: (id, image) => menu().setCategoryImage(id, image),
    uploadImage: (image, area) =>
        area === "menu" && isMenuLive() ? apiMenuRepository.uploadMenuImage(image) : localRepository.uploadImage(image),
};
