// The one door dashboard screens use to change data. Every method is async
// and returns a Result, never throws for expected failures, so screens handle
// "saved" and "failed" the same way whatever is behind it.
//
// localRepository: the browser draft. apiMenuRepository / apiOffersRepository:
// Server Actions → the Laravel API, used for an area when the server says it's
// live (API_BASE_URL set): the menu (D7c), offers (D7d), banners (D7e),
// reviews (D7f), hero + about (D7g), site info (D7h), ordering (D7i): every
// area. Without the API, everything stays on the draft. Screens don't change.

import { fail, type Result } from "@/lib/api/errors";
import {
    apiBannersRepository,
    apiHomeRepository,
    apiInfoRepository,
    apiMenuRepository,
    apiOffersRepository,
    apiOrderingRepository,
    apiReviewsRepository,
    uploadImageToApi,
} from "@/lib/dashboard/api-repository";
import { currentData, isLive } from "@/lib/dashboard/draft-store";
import type { PreparedImage } from "@/lib/dashboard/image-processing";
import { localRepository } from "@/lib/dashboard/local-repository";
import { checkProductQuickChanges, type ProductQuickChanges } from "@/lib/dashboard/validation";
import type { AboutContent, HeroContent, MenuBanner, Offer, Review, SiteInfo } from "@/types/content";
import type {
    BannerInput,
    LiveArea,
    OfferInput,
    OffersSettings,
    ProductInput,
    ReviewInput,
    ReviewsSettings,
    SiteInfoInput,
} from "@/types/dashboard";
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
    /** `slug`: the optional «رابط» (lib/slug); missing → a neutral id. */
    createCategory(name: string, slug?: string): Promise<Result<Category>>;
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
    saveSiteInfo(input: SiteInfoInput): Promise<Result<SiteInfo>>;
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
     * `area` (the photo's area: "menu" for products and category cards,
     * "offers" for offers and the offers card) → the API's uploads when that
     * area is live. Other areas keep their photos in this browser: the API
     * deletes an upload that no API record uses after 24 h.
     */
    uploadImage(image: PreparedImage, area?: LiveArea): Promise<Result<{ src: string }>>;
    /** Drops every local edit (browser draft only; the menu on the server isn't touched). */
    resetToOriginal(): Promise<Result<null>>;
}

/** The API when the area is live, else the browser draft (checked on every call). */
const menu = () => (isLive("menu") ? apiMenuRepository : localRepository);

/**
 * A quick change from the list, checked here before it's sent (the browser
 * draft checks it too, the API checks it again): the owner hears it at once,
 * e.g. a lower price that would make a size free.
 */
async function updateProductChecked(id: string, changes: ProductQuickChanges): Promise<Result<Product>> {
    const product = currentData().products.find((candidate) => candidate.id === id);
    const error = product && checkProductQuickChanges(product, changes);
    return error ? fail(error) : menu().updateProduct(id, changes);
}
const offers = () => (isLive("offers") ? apiOffersRepository : localRepository);
const banners = () => (isLive("banners") ? apiBannersRepository : localRepository);
const reviews = () => (isLive("reviews") ? apiReviewsRepository : localRepository);
const home = () => (isLive("home") ? apiHomeRepository : localRepository);
const info = () => (isLive("info") ? apiInfoRepository : localRepository);
const orderingArea = () => (isLive("ordering") ? apiOrderingRepository : localRepository);

export const repository: DashboardRepository = {
    ...localRepository,
    saveOrdering: (input) => orderingArea().saveOrdering(input),
    saveSiteInfo: (input) => info().saveSiteInfo(input),
    saveHero: (input) => home().saveHero(input),
    saveAbout: (input) => home().saveAbout(input),
    updateReviewsSettings: (changes) => reviews().updateReviewsSettings(changes),
    createReview: (input) => reviews().createReview(input),
    saveReview: (id, input) => reviews().saveReview(id, input),
    setReviewVisible: (id, isVisible) => reviews().setReviewVisible(id, isVisible),
    moveReview: (id, direction) => reviews().moveReview(id, direction),
    deleteReview: (id) => reviews().deleteReview(id),
    createBanner: (input) => banners().createBanner(input),
    saveBanner: (id, input) => banners().saveBanner(id, input),
    setBannerActive: (id, isActive) => banners().setBannerActive(id, isActive),
    moveBanner: (id, direction) => banners().moveBanner(id, direction),
    deleteBanner: (id) => banners().deleteBanner(id),
    updateOffersSettings: (changes) => offers().updateOffersSettings(changes),
    createOffer: (input) => offers().createOffer(input),
    saveOffer: (id, input) => offers().saveOffer(id, input),
    setOfferActive: (id, isActive) => offers().setOfferActive(id, isActive),
    moveOffer: (id, direction) => offers().moveOffer(id, direction),
    deleteOffer: (id) => offers().deleteOffer(id),
    updateProduct: updateProductChecked,
    createProduct: (input) => menu().createProduct(input),
    saveProduct: (id, input) => menu().saveProduct(id, input),
    deleteProduct: (id) => menu().deleteProduct(id),
    moveBestSeller: (id, direction) => menu().moveBestSeller(id, direction),
    createCategory: (name, slug) => menu().createCategory(name, slug),
    renameCategory: (id, name) => menu().renameCategory(id, name),
    moveCategory: (id, direction) => menu().moveCategory(id, direction),
    deleteCategory: (id) => menu().deleteCategory(id),
    setCategoryImage: (id, image) => menu().setCategoryImage(id, image),
    uploadImage: (image, area) => (area && isLive(area) ? uploadImageToApi(image) : localRepository.uploadImage(image)),
};
