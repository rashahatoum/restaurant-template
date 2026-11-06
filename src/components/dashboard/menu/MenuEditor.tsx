"use client";

import ToastViewport from "@/components/dashboard/feedback/ToastViewport";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/useToast";
import type { Result } from "@/lib/api/errors";
import { repository } from "@/lib/dashboard/repository";
import { validatePrice, type ProductQuickChanges } from "@/lib/dashboard/validation";
import { formatPrice } from "@/lib/format-price";
import type { DashboardData } from "@/types/dashboard";
import type { Product } from "@/types/menu";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import ProductQuickRow from "./ProductQuickRow";

interface MenuEditorProps {
    seed: DashboardData;
    /** From ?category= (coming back from a product form keeps the tab). */
    initialCategoryId?: string;
    /** From ?done=&name=: what the product form just did, shown once as a toast. */
    notice?: MenuNotice;
}

export interface MenuNotice {
    done: "added" | "saved" | "deleted";
    name: string;
}

const NOTICE_TEXT: Record<MenuNotice["done"], (name: string) => string> = {
    added: (name) => `انضاف ${name}`,
    saved: (name) => `انحفظ ${name}`,
    deleted: (name) => `انحذف ${name}`,
};

/** What the toast says after a quick change. */
function describeChange(name: string, changes: ProductQuickChanges): string {
    if (changes.price !== undefined) return `صار سعر ${name} ${formatPrice(changes.price)}`;
    if (changes.isAvailable !== undefined) return `${name}: ${changes.isAvailable ? "متوفر" : "غير متوفر"}`;
    return changes.isBestSeller ? `${name} انضاف للأكثر مبيعاً` : `${name} انشال من الأكثر مبيعاً`;
}

/** The product's current values for the changed fields (what "تراجع" puts back). */
function previousValues(product: Product, changes: ProductQuickChanges): ProductQuickChanges {
    return Object.fromEntries(
        Object.keys(changes).map((key) => [key, product[key as keyof ProductQuickChanges]])
    ) as ProductQuickChanges;
}

// Products by category, with quick edits (price, available, best seller).
// Every change saves at once through the repository; the toast offers "تراجع".
const MenuEditor = ({ seed, initialCategoryId, notice }: MenuEditorProps) => {
    const data = useDashboardData(seed);
    const { toast, show, hide } = useToast();
    const categories = data.categories;
    const [activeId, setActiveId] = useState(
        categories.some((category) => category.id === initialCategoryId) ? initialCategoryId : categories[0]?.id
    );
    const products = data.products.filter((product) => product.categoryId === activeId);

    // Back from the product form: say what happened once, then drop it from the
    // URL (a refresh shouldn't repeat it). Primitive deps: the object is new on every render.
    const noticeDone = notice?.done;
    const noticeName = notice?.name;
    useEffect(() => {
        if (!noticeDone || !noticeName) return;
        show({ tone: "success", message: NOTICE_TEXT[noticeDone](noticeName) });
        const url = new URL(window.location.href);
        url.searchParams.delete("done");
        url.searchParams.delete("name");
        window.history.replaceState(null, "", url);
    }, [noticeDone, noticeName, show]);

    // The tab lives in the URL too, so "back" from a product form returns to it.
    // Native replaceState: Next.js keeps its router in sync, no server round trip.
    const selectCategory = (id: string) => {
        setActiveId(id);
        window.history.replaceState(null, "", `?category=${encodeURIComponent(id)}`);
    };

    const undo = async (id: string, previous: ProductQuickChanges) => {
        const result = await repository.updateProduct(id, previous);
        show(result.ok ? { tone: "success", message: "رجعناها متل ما كانت" } : { tone: "error", message: result.error.message });
    };

    const apply = async (product: Product, changes: ProductQuickChanges): Promise<Result<unknown>> => {
        const previous = previousValues(product, changes);
        const result = await repository.updateProduct(product.id, changes);

        if (result.ok) {
            show({
                tone: "success",
                message: describeChange(product.name, changes),
                action: { label: "تراجع", onClick: () => undo(product.id, previous) },
            });
        } else if (!result.error.fieldErrors?.price) {
            // Price errors show under the price field instead
            show({
                tone: "error",
                message: result.error.message,
                action:
                    result.error.kind === "validation"
                        ? undefined
                        : { label: "جرّب مرة تانية", onClick: () => apply(product, changes) },
            });
        }
        return result;
    };

    // Checked here first: text that isn't a number never reaches the repository
    const changePrice = async (product: Product, price: number | null): Promise<Result<unknown>> => {
        const checked = validatePrice(price);
        return checked.ok ? apply(product, { price: checked.data }) : checked;
    };

    return (
        <>
            {/* =========================
                CATEGORIES
            ========================== */}

            <nav aria-label="أقسام المنيو" className="mb-16">
                <ul className="flex flex-wrap gap-8">
                    {categories.map((category) => {
                        const count = data.products.filter((product) => product.categoryId === category.id).length;
                        const isActive = category.id === activeId;
                        return (
                            <li key={category.id}>
                                <button
                                    type="button"
                                    aria-pressed={isActive}
                                    onClick={() => selectCategory(category.id)}
                                    className={`inline-flex h-40 items-center gap-6 rounded-full border px-16 text-sm font-bold transition-colors ${
                                        isActive
                                            ? "border-primary bg-primary text-background"
                                            : "border-border bg-surface text-muted hover:text-foreground"
                                    }`}
                                >
                                    {category.name}
                                    <span className={`tabular-nums ${isActive ? "opacity-80" : "opacity-70"}`}>{count}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* =========================
                PRODUCTS
            ========================== */}

            <div className="mb-12 flex items-center justify-between gap-12">
                <p className="text-sm text-muted">اكبس على اسم الصنف لتعدّل كل تفاصيله.</p>
                <Link
                    href={`/dashboard/menu/new${activeId ? `?category=${encodeURIComponent(activeId)}` : ""}`}
                    className="inline-flex h-40 shrink-0 items-center gap-6 rounded-full bg-primary px-16 text-sm font-extrabold text-background transition-opacity hover:opacity-90"
                >
                    <FiPlus aria-hidden="true" />
                    إضافة صنف
                </Link>
            </div>

            {products.length > 0 ? (
                <ul className="grid gap-10 md:grid-cols-2">
                    {products.map((product) => (
                        <li key={product.id}>
                            <ProductQuickRow product={product} onChange={apply} onPriceChange={changePrice} />
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="rounded-2xl border border-dashed border-border px-16 py-40 text-center text-muted">
                    ما في أصناف بهالقسم.
                </p>
            )}

            <ToastViewport toast={toast} onClose={hide} />
        </>
    );
};

export default MenuEditor;
