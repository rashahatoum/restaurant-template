import CartView from "@/components/cart/CartView";
import DetailsHint from "@/components/ui/DetailsHint";
import RouteSheet from "@/components/ui/RouteSheet";
import { getCartCatalog } from "@/services/cart";
import { getOrderingOptions } from "@/services/ordering";
import Link from "next/link";

// Intercepts /cart on client navigation from any (site) page and shows the
// cart as a popup over it. A refresh or direct link gets the full /cart page.
const CartModal = async () => {
    const [catalog, orderingOptions] = await Promise.all([getCartCatalog(), getOrderingOptions()]);

    return (
        <RouteSheet
            title="سلتك"
            headerAction={
                <Link href="/menu" className="group">
                    <DetailsHint>عودة للقائمة</DetailsHint>
                </Link>
            }
        >
            <CartView catalog={catalog} orderingOptions={orderingOptions} layout="sheet" />
        </RouteSheet>
    );
};

export default CartModal;
