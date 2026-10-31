// What can be ordered, with current prices. Built on the server and passed to
// the cart UI, which prices the stored lines against it (never against
// prices saved in the browser).

import { offerKey, productKey } from "@/lib/cart";
import { getSingleChoiceGroup } from "@/lib/menu";
import { getOffersContent } from "@/services/content";
import { getMenu } from "@/services/menu";
import type { CartCatalog, CartCatalogItem } from "@/types/cart";

export async function getCartCatalog(): Promise<CartCatalog> {
    const [sections, offers] = await Promise.all([getMenu(), getOffersContent()]);
    const catalog: Record<string, CartCatalogItem> = {};

    for (const offer of offers?.offers ?? []) {
        catalog[offerKey(offer.id)] = {
            name: offer.title,
            image: offer.image,
            price: offer.price,
            isAvailable: true,
        };
    }

    for (const { products } of sections) {
        for (const product of products) {
            catalog[productKey(product.id)] = {
                name: product.name,
                image: product.image,
                price: product.price,
                isAvailable: product.isAvailable,
                options: getSingleChoiceGroup(product)?.options,
            };
        }
    }

    return catalog;
}
