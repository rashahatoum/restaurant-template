"use client";

import FieldError from "@/components/dashboard/feedback/FieldError";
import ToastViewport from "@/components/dashboard/feedback/ToastViewport";
import { inputClasses } from "@/components/dashboard/form/field-styles";
import ReorderList from "@/components/dashboard/ReorderList";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useToast } from "@/hooks/useToast";
import { repository } from "@/lib/dashboard/repository";
import { undoBestSellerPlace } from "@/lib/dashboard/validation";
import { sortBestSellers } from "@/lib/menu";
import type { DashboardData } from "@/types/dashboard";
import type { Product } from "@/types/menu";
import { useState, type FormEvent } from "react";
import { FiPlus } from "react-icons/fi";
import BestSellerRow from "./BestSellerRow";

// The home "الأكثر مبيعاً" slider: which products and in what order. The data
// lives on each product (isBestSeller + bestSellerOrder), so the star in the
// menu list and this screen always agree.
const BestSellersEditor = ({ seed }: { seed: DashboardData }) => {
    const data = useDashboardData(seed);
    const { toast, show, hide } = useToast();
    const [toAdd, setToAdd] = useState("");
    const [addError, setAddError] = useState<string>();

    const bestSellers = sortBestSellers(data.products);
    // The slider shows the dish: only products with a photo can be added
    const candidates = data.categories
        .map((category) => ({
            category,
            products: data.products.filter((product) => product.categoryId === category.id && !product.isBestSeller && product.image),
        }))
        .filter((group) => group.products.length > 0);
    const withoutPhoto = data.products.filter((product) => !product.isBestSeller && !product.image).length;

    const add = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!toAdd) return setAddError("اختار صنف من القائمة");
        const result = await repository.updateProduct(toAdd, { isBestSeller: true });
        if (!result.ok) return setAddError(result.error.fieldErrors?.isBestSeller?.[0] ?? result.error.message);
        setAddError(undefined);
        setToAdd("");
        show({
            tone: "success",
            message: `انضاف ${result.data.name} آخر السلايدر`,
            action: { label: "تراجع", onClick: () => remove(result.data, { silent: true }) },
        });
    };

    const remove = async (product: Product, { silent = false } = {}) => {
        const changes = { isBestSeller: false };
        const result = await repository.updateProduct(product.id, changes);
        if (!result.ok) return show({ tone: "error", message: result.error.message });
        if (silent) return show({ tone: "success", message: "رجعناها متل ما كانت" });
        show({
            tone: "success",
            message: `${product.name} انشال من الأكثر مبيعاً`,
            action: {
                label: "تراجع",
                // Back in its old place, not at the end
                onClick: async () => {
                    const undo = await repository.updateProduct(product.id, { isBestSeller: true, ...undoBestSellerPlace(product, changes) });
                    show(undo.ok ? { tone: "success", message: "رجعناها متل ما كانت" } : { tone: "error", message: undo.error.message });
                },
            },
        });
    };

    // The list glides to the new order (ReorderList): a toast only when it fails
    const move = async (product: Product, direction: "up" | "down") => {
        const result = await repository.moveBestSeller(product.id, direction);
        if (!result.ok) show({ tone: "error", message: result.error.message });
    };

    return (
        <>
            {/* =========================
                ADD
            ========================== */}

            <form onSubmit={add} noValidate className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-12">
                <label htmlFor="best-seller-add" className="text-sm font-bold">
                    ضيف صنف للسلايدر
                </label>
                <div className="flex gap-8">
                    <select
                        id="best-seller-add"
                        value={toAdd}
                        onChange={(event) => setToAdd(event.target.value)}
                        disabled={candidates.length === 0}
                        aria-invalid={Boolean(addError)}
                        aria-describedby={[withoutPhoto > 0 && "best-seller-add-hint", addError && "best-seller-add-error"].filter(Boolean).join(" ") || undefined}
                        className={`${inputClasses} min-w-0 cursor-pointer`}
                    >
                        <option value="">{candidates.length > 0 ? "اختار صنف…" : "كل الأصناف اللي إلها صورة مضافة"}</option>
                        {candidates.map(({ category, products }) => (
                            <optgroup key={category.id} label={category.name}>
                                {products.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <button
                        type="submit"
                        disabled={candidates.length === 0}
                        className="inline-flex h-44 shrink-0 items-center gap-6 rounded-full bg-primary px-16 font-extrabold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                        <FiPlus aria-hidden="true" />
                        ضيف
                    </button>
                </div>
                {withoutPhoto > 0 && (
                    <p id="best-seller-add-hint" className="text-xs text-muted">
                        الأصناف اللي ما إلها صورة ما بتطلع هون ({withoutPhoto})، لأنه السلايدر بيعرض صورة الطبق. ضيفلها صورة من المنيو أول.
                    </p>
                )}
                <FieldError id="best-seller-add-error" message={addError} />
            </form>

            {/* =========================
                LIST (slider order)
            ========================== */}

            {bestSellers.length > 0 ? (
                <ReorderList className="flex flex-col gap-10">
                    {bestSellers.map((product, index) => (
                        <li key={product.id} data-flip-id={product.id}>
                            <BestSellerRow
                                product={product}
                                index={index}
                                total={bestSellers.length}
                                onMove={(direction) => move(product, direction)}
                                onRemove={() => remove(product)}
                            />
                        </li>
                    ))}
                </ReorderList>
            ) : (
                <p className="rounded-2xl border border-dashed border-border px-16 py-40 text-center text-muted">
                    ما في أصناف بالأكثر مبيعاً، فالقسم مخفي من الرئيسية. ضيف صنف من فوق.
                </p>
            )}

            <ToastViewport toast={toast} onClose={hide} />
        </>
    );
};

export default BestSellersEditor;
