import CartView from "@/components/cart/CartView";
import DetailsHint from "@/components/ui/DetailsHint";
import Link from "next/link";
import { getCartCatalog } from "@/services/cart";
import { getOrderingOptions } from "@/services/ordering";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "السلة",
    // Personal and empty for crawlers: nothing to index.
    robots: { index: false },
};

// Server shell: fetches current prices and ordering settings; the cart
// itself lives in the browser.
const CartPage = async () => {
    const [catalog, orderingOptions] = await Promise.all([
        getCartCatalog(),
        getOrderingOptions(),
    ]);

    return (
        // pt: the NavBar is absolutely positioned over the page top
        <main className="px-page-gutter pb-80 pt-96 md:pb-120 md:pt-120">
            <div className="mb-20 flex flex-wrap items-center gap-x-16 gap-y-4 md:mb-32">
                <h1 className="font-display text-3xl font-bold md:text-4xl">سلتك</h1>
                <Link href="/menu" className="group">
                    <DetailsHint>عودة للقائمة</DetailsHint>
                </Link>
            </div>
            <CartView catalog={catalog} orderingOptions={orderingOptions} />
        </main>
    );
};

export default CartPage;
