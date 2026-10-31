import CartView from "@/components/cart/CartView";
import { getCartCatalog } from "@/services/cart";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "السلة",
    // Personal and empty for crawlers: nothing to index.
    robots: { index: false },
};

// Server shell: fetches current prices; the cart itself lives in the browser.
const CartPage = async () => {
    const catalog = await getCartCatalog();

    return (
        // pt: the NavBar is absolutely positioned over the page top
        <main className="px-page-gutter pb-80 pt-96 md:pb-120 md:pt-120">
            <h1 className="mb-20 font-display text-3xl font-bold md:mb-32 md:text-4xl">سلتك</h1>
            <CartView catalog={catalog} />
        </main>
    );
};

export default CartPage;
