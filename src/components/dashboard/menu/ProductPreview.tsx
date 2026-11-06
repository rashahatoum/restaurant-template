"use client";

import ItemDetails from "@/components/menu/ItemDetails";
import MenuItemRow from "@/components/menu/MenuItemRow";
import { useImageSrc } from "@/hooks/useImageSrc";
import { productKey } from "@/lib/cart";
import { getSingleChoiceGroup, toMenuItemDetails } from "@/lib/menu";
import type { Product } from "@/types/menu";
import { useState, type MouseEvent } from "react";

type PreviewTab = "row" | "page";

const TABS: { id: PreviewTab; label: string }[] = [
    { id: "row", label: "بالقائمة" },
    { id: "page", label: "صفحة الصنف" },
];

/** Links inside the preview point at the public site: keep the owner on the form. */
const stayOnForm = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target instanceof Element && event.target.closest("a")) event.preventDefault();
};

// The product as customers will see it, with the site's own components
// (MenuItemRow, ItemDetails), updated as the owner types. The size toggle
// works (`preview`), the cart is never touched, and links don't navigate.
// The only state here is the chosen tab.
const ProductPreview = ({ product: input }: { product: Product }) => {
    const [tab, setTab] = useState<PreviewTab>("row");
    // A photo added on this device is an IndexedDB reference: the site's
    // components get its object URL (next/image serves blob: URLs as they are)
    const product = { ...input, image: useImageSrc(input.image) };
    const sizeGroup = getSingleChoiceGroup(product);

    return (
        <section aria-label="معاينة" className="flex flex-col gap-10">
            <div className="flex items-center justify-between gap-8">
                <h2 className="text-sm font-bold text-muted">معاينة: هيك رح يشوفه الزبون</h2>
                <div className="flex rounded-full border border-border bg-background p-3">
                    {TABS.map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            aria-pressed={tab === id}
                            onClick={() => setTab(id)}
                            className="h-30 rounded-full px-12 text-xs font-bold text-muted transition-colors aria-pressed:bg-primary aria-pressed:text-background"
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            <div onClickCapture={stayOnForm} className="rounded-3xl border border-dashed border-border p-10">
                {tab === "row" ? (
                    <MenuItemRow
                        id={`preview-${product.id}`}
                        itemKey={productKey(product.id)}
                        href={`/menu/${product.id}`}
                        name={product.name}
                        details={product.ingredients}
                        image={product.image}
                        imageStyle={product.imageStyle}
                        price={product.price}
                        badge={product.isBestSeller ? "الأكثر طلباً" : undefined}
                        isAvailable={product.isAvailable}
                        options={sizeGroup?.options}
                        optionsLabel={sizeGroup?.name}
                        preview
                    />
                ) : (
                    // ItemDetails fills its box's height (one screen on a phone)
                    <div className="mx-auto h-600 max-w-360">
                        <ItemDetails item={toMenuItemDetails(product)} headingLevel="h2" preview />
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProductPreview;
