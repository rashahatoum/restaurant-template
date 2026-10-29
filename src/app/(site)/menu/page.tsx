import MenuBannerSlide from "@/components/menu/MenuBannerSlide";
import MenuBrowser, { type MenuBrowserSection } from "@/components/menu/MenuBrowser";
import MenuItemRow from "@/components/menu/MenuItemRow";
import AutoCarousel from "@/components/ui/AutoCarousel";
import { restaurantConfig } from "@/config/restaurant";
import { normalizeArabic } from "@/lib/search";
import { getMenuBanners, getOffersContent } from "@/services/content";
import { getMenu } from "@/services/menu";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "القائمة",
    description: `قائمة ${restaurantConfig.name}: عروض، سندويشات شاورما، وجبات، وفروج مشوي وبروستد، بالأسعار. اختار طلبك وأضفه للسلة.`,
};

/** Section id for a category (the section dropdown and banner links jump to it). */
const categoryAnchor = (categoryId: string) => `category-${categoryId}`;

/** The offers section id: banner slides and home offer cards link here. */
const OFFERS_ANCHOR = categoryAnchor("offers");

const OFFERS_ICON = "🎁";
const DEFAULT_CATEGORY_ICON = "🍽️";

/** What a search can match: name, details, free item, option names. */
const toSearchText = (...parts: readonly string[]) => normalizeArabic(parts.join(" "));

// The QR / link target. Server Component: rows are rendered here; only the
// carousel, the sticky bar/search (MenuBrowser) and each row's option
// toggle + add button run on the client.
const MenuPage = async () => {
    const [categorySections, banners, offers] = await Promise.all([
        getMenu(),
        getMenuBanners(),
        // null when the offers section is off or has no active offer
        getOffersContent(),
    ]);

    const offersSection: MenuBrowserSection | null = offers && {
        id: OFFERS_ANCHOR,
        title: "العروض",
        icon: OFFERS_ICON,
        entries: offers.offers.map((offer) => ({
            key: `offer-${offer.id}`,
            searchText: toSearchText(offer.title, ...offer.items, offer.freeItem),
            node: (
                <MenuItemRow
                    id={`offer-${offer.id}`}
                    name={offer.title}
                    details={offer.items}
                    freeItem={offer.freeItem}
                    image={offer.image}
                    price={offer.price}
                    badge={offer.badge}
                    isAvailable
                />
            ),
        })),
    };

    const sections: MenuBrowserSection[] = [
        ...(offersSection ? [offersSection] : []),
        ...categorySections.map(({ category, products }) => ({
            id: categoryAnchor(category.id),
            title: category.name,
            icon: category.icon ?? DEFAULT_CATEGORY_ICON,
            entries: products.map((product) => {
                // Only price-changing single choices (size) are shown here.
                const sizeGroup = product.optionGroups?.find((group) => group.maxSelect === 1);

                return {
                    key: product.id,
                    searchText: toSearchText(
                        product.name,
                        ...product.ingredients,
                        ...(sizeGroup?.options.map((option) => option.name) ?? [])
                    ),
                    node: (
                        <MenuItemRow
                            id={product.id}
                            name={product.name}
                            details={product.ingredients}
                            image={product.image}
                            price={product.price}
                            badge={product.isBestSeller ? "الأكثر طلباً" : undefined}
                            isAvailable={product.isAvailable}
                            options={sizeGroup?.options}
                            optionsLabel={sizeGroup?.name}
                        />
                    ),
                };
            }),
        })),
    ];

    return (
        // pt: the NavBar is absolutely positioned over the page top
        <main className="pb-80 pt-80 md:pb-120">
            <div className="px-page-gutter">
                {/* Visible from md; on phones the banner and items come first */}
                <header className="sr-only md:not-sr-only md:pb-24 md:pt-24">
                    <p className="mb-6 text-sm font-bold text-primary">
                        اختار وجبتك وأضفها للسلة
                    </p>
                    <h1 className="font-display text-4xl font-bold">القائمة</h1>
                </header>

                {banners.length > 0 && (
                    <AutoCarousel label="عروض وأخبار" interval={3000}>
                        {banners.map((banner, index) => (
                            <MenuBannerSlide
                                key={banner.id}
                                eyebrow={banner.eyebrow}
                                title={banner.title}
                                image={banner.image}
                                background={restaurantConfig.hero.background}
                                action={banner.action}
                                preload={index === 0}
                            />
                        ))}
                    </AutoCarousel>
                )}
            </div>

            {sections.length === 0 ? (
                <div className="flex flex-col items-center gap-12 px-page-gutter py-80 text-center">
                    <p className="font-display text-2xl font-bold">القائمة عم تتجهّز</p>
                    <p className="text-muted">ارجعلنا بعد شوي، أو تواصل معنا على الواتساب.</p>
                    <Link
                        href="/#contact"
                        className="mt-8 rounded-full bg-primary px-20 py-10 font-bold text-background transition-opacity hover:opacity-90"
                    >
                        تواصل معنا
                    </Link>
                </div>
            ) : (
                <div className="mt-8 md:mt-16">
                    <MenuBrowser sections={sections} />
                </div>
            )}
        </main>
    );
};

export default MenuPage;
