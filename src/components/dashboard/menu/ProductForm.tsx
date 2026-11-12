"use client";

import ConfirmDialog from "@/components/dashboard/ConfirmDialog";
import AppErrorAlert from "@/components/dashboard/feedback/AppErrorAlert";
import ErrorState from "@/components/dashboard/feedback/ErrorState";
import ChipsInput from "@/components/dashboard/form/ChipsInput";
import ImagePicker from "@/components/dashboard/form/ImagePicker";
import FieldShell, { describedBy } from "@/components/dashboard/form/FieldShell";
import { inputClasses, textareaClasses } from "@/components/dashboard/form/field-styles";
import SaveBar from "@/components/dashboard/form/SaveBar";
import Switch from "@/components/dashboard/Switch";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useFormGuards } from "@/hooks/useFormGuards";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useSingleSubmit } from "@/hooks/useSingleSubmit";
import { fieldError, type AppError } from "@/lib/api/errors";
import { withNotice, type DoneAction } from "@/lib/dashboard/notice";
import {
    isSameForm,
    newSizeRowId,
    parseProductForm,
    previewProduct,
    toFormValues,
    type ProductFormValues,
} from "@/lib/dashboard/product-form";
import { repository } from "@/lib/dashboard/repository";
import { PRODUCT_LIMITS, sizeField } from "@/lib/dashboard/validation";
import type { DashboardData } from "@/types/dashboard";
import type { Category, Product } from "@/types/menu";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { FiChevronLeft, FiTrash2 } from "react-icons/fi";
import ProductPreview from "./ProductPreview";
import SizesEditor from "./SizesEditor";

interface ProductFormProps {
    seed: DashboardData;
    /** Edit this product; without it the form adds a new one. */
    productId?: string;
    /** New product: the category it starts in (from the list's active tab). */
    initialCategoryId?: string;
}

/** Back to the product's tab in the list, with the toast to show there (see MenuEditor). */
const listUrl = (categoryId: string, done: DoneAction, name: string) =>
    withNotice(`/dashboard/menu?category=${encodeURIComponent(categoryId)}`, done, name);

// Waits for the browser draft before building the form: initial values are
// taken once (useState), so they must come from the draft, not the server
// seed used during hydration. A product created on this device only exists
// in the draft.
const ProductForm = ({ seed, productId, initialCategoryId }: ProductFormProps) => {
    const data = useDashboardData(seed);
    const isHydrated = useIsHydrated();
    // Set just before deleting: the product leaves the draft before the page
    // changes, which would flash "not found" for a moment
    const [isLeaving, setIsLeaving] = useState(false);

    if (!isHydrated || isLeaving) return <div aria-busy="true" className="min-h-480" />;

    const product = productId ? data.products.find((candidate) => candidate.id === productId) : undefined;
    if (productId && !product) {
        return (
            <ErrorState
                title="هالصنف مش موجود"
                message="يمكن انحذف، أو الرابط غلط."
                actions={
                    <Link href="/dashboard/menu" className="inline-flex h-44 items-center rounded-full bg-primary px-20 font-extrabold text-background">
                        رجوع للمنيو
                    </Link>
                }
            />
        );
    }

    const startCategory = data.categories.some((category) => category.id === initialCategoryId)
        ? (initialCategoryId as string)
        : (data.categories[0]?.id ?? "");

    return (
        <ProductEditor
            // A different product (or after a reset) starts from fresh values
            key={productId ?? "new"}
            product={product}
            categories={data.categories}
            startCategory={startCategory}
            onLeave={setIsLeaving}
        />
    );
};

interface ProductEditorProps {
    product?: Product;
    categories: readonly Category[];
    startCategory: string;
    /** true just before deleting (the parent shows a placeholder); false if it failed. */
    onLeave: (isLeaving: boolean) => void;
}

// The form itself, with a live preview. Client because the values change as
// the owner types; the page around it (title, back link) is server-rendered.
// Saves go through the repository, so the Laravel API can replace the browser
// draft without touching this.
const ProductEditor = ({ product, categories, startCategory, onLeave }: ProductEditorProps) => {
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);

    const [initial] = useState(() => toFormValues(product, startCategory));
    const [values, setValues] = useState(initial);
    const [error, setError] = useState<AppError>();
    const { isSaving, run } = useSingleSubmit();
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const isDirty = !isSameForm(values, initial);
    useFormGuards(formRef, error, isDirty);

    const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) =>
        setValues((current) => ({ ...current, [key]: value }));
    const errorOf = (field: string) => fieldError(error, field);

    // Removing every size brings the single price back from the first size
    const setSizes = (sizes: ProductFormValues["sizes"]) =>
        setValues((current) => ({
            ...current,
            sizes,
            ...(sizes.length === 0 && current.sizes.length > 0 ? { price: current.sizes[0].price } : {}),
        }));

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const parsed = parseProductForm(values);
        if (!parsed.ok) return setError(parsed.error);

        const input = parsed.data;
        const result = await run(() => (product ? repository.saveProduct(product.id, input) : repository.createProduct(input)));
        if (!result) return; // a second tap while saving
        if (!result.ok) return setError(result.error);
        // Back to the product's tab in the list, which shows what happened (owner)
        router.push(listUrl(result.data.categoryId, product ? "saved" : "added", result.data.name));
    };

    const remove = async () => {
        setIsConfirmingDelete(false);
        if (!product) return;
        onLeave(true);
        const result = await repository.deleteProduct(product.id);
        if (!result.ok) {
            // Rare (the product was already gone): the form comes back, remounted.
            // With the API, show result.error here once the parent can hold a toast.
            onLeave(false);
            return;
        }
        router.push(listUrl(product.categoryId, "deleted", product.name));
    };

    const nameError = errorOf("name");
    const priceError = errorOf("price");
    const categoryError = errorOf("categoryId");
    const descriptionError = errorOf("description");
    const ingredientsError = errorOf("ingredients");
    const bestSellerError = errorOf("isBestSeller");
    const hasSizes = values.sizes.length > 0;
    const hasSizeErrors = Object.keys(error?.fieldErrors ?? {}).some((key) => key.startsWith("optionGroups"));

    return (
        <>
            <form ref={formRef} onSubmit={submit} noValidate className="grid gap-24 lg:grid-cols-[1fr_400px] lg:items-start">
                {/* Preview first on phones; on desktop it stays in sight beside the form */}
                <div className="lg:sticky lg:top-96 lg:col-start-2 lg:row-start-1">
                    <ProductPreview product={previewProduct(values, product?.id ?? "preview")} />
                </div>

                <div className="flex flex-col gap-18 lg:col-start-1 lg:row-start-1">
                    {error && <AppErrorAlert error={error} />}

                    <FieldShell htmlFor="product-name" label="اسم الصنف" error={nameError} counter={`${values.name.length}/${PRODUCT_LIMITS.name}`}>
                        <input
                            id="product-name"
                            value={values.name}
                            onChange={(event) => set("name", event.target.value)}
                            maxLength={PRODUCT_LIMITS.name}
                            placeholder="متل: شاورما جاج"
                            aria-invalid={Boolean(nameError)}
                            aria-describedby={describedBy("product-name", { error: nameError })}
                            className={inputClasses}
                        />
                    </FieldShell>

                    <div className="grid gap-18 md:grid-cols-2">
                        {/* With sizes, each size has its own price (in the sizes list below) */}
                        {!hasSizes && (
                        <FieldShell htmlFor="product-price" label="السعر (ل.س)" error={priceError}>
                            <input
                                id="product-price"
                                value={values.price}
                                onChange={(event) => set("price", event.target.value)}
                                inputMode="numeric"
                                dir="ltr"
                                placeholder="250"
                                aria-invalid={Boolean(priceError)}
                                aria-describedby={describedBy("product-price", { error: priceError })}
                                className={`${inputClasses} text-end tabular-nums`}
                            />
                        </FieldShell>
                        )}

                        <FieldShell htmlFor="product-category" label="القسم" error={categoryError}>
                            <select
                                id="product-category"
                                value={values.categoryId}
                                onChange={(event) => set("categoryId", event.target.value)}
                                aria-invalid={Boolean(categoryError)}
                                aria-describedby={describedBy("product-category", { error: categoryError })}
                                className={`${inputClasses} cursor-pointer`}
                            >
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </FieldShell>
                    </div>

                    <FieldShell
                        htmlFor="product-description"
                        label="الوصف"
                        error={descriptionError}
                        counter={`${values.description.length}/${PRODUCT_LIMITS.description}`}
                        hint="جملة قصيرة بتطلع بصفحة الصنف ورابط المشاركة."
                    >
                        <textarea
                            id="product-description"
                            value={values.description}
                            onChange={(event) => set("description", event.target.value)}
                            maxLength={PRODUCT_LIMITS.description}
                            rows={2}
                            aria-invalid={Boolean(descriptionError)}
                            aria-describedby={describedBy("product-description", { hasHint: true, error: descriptionError })}
                            className={textareaClasses}
                        />
                    </FieldShell>

                    <FieldShell
                        htmlFor="product-ingredients"
                        label="المكونات"
                        error={ingredientsError}
                        counter={`${values.ingredients.length}/${PRODUCT_LIMITS.ingredients}`}
                        hint="اكتب المكوّن واكبس Enter أو فاصلة. المشروبات ما إلها مكونات، اتركها فاضية."
                    >
                        <ChipsInput
                            id="product-ingredients"
                            values={values.ingredients}
                            onChange={(next) => set("ingredients", next)}
                            max={PRODUCT_LIMITS.ingredients}
                            maxLength={PRODUCT_LIMITS.ingredient}
                            placeholder="متل: ثوم"
                            invalid={Boolean(ingredientsError)}
                            describedBy={describedBy("product-ingredients", { hasHint: true, error: ingredientsError })}
                        />
                    </FieldShell>

                    <ImagePicker
                        id="product-image"
                        label="صورة الصنف"
                        hint="مربعة. الأحسن صحن مقصوص على خلفية شفافة (PNG أو WebP)، أو صورة كاملة بتطلع بزوايا مدوّرة. بنصغّرها لحالنا."
                        value={values.image}
                        imageStyle={values.imageStyle}
                        onChange={({ image, imageStyle }) => setValues((current) => ({ ...current, image, imageStyle }))}
                        area="menu"
                    />

                    <div className="flex flex-col gap-10 rounded-2xl border border-border bg-surface p-12">
                        <Switch checked={values.isAvailable} onChange={(checked) => set("isAvailable", checked)} label="متوفر" />
                        <Switch
                            checked={values.isBestSeller}
                            onChange={(checked) => set("isBestSeller", checked)}
                            label="الأكثر مبيعاً (بيطلع بسلايدر الرئيسية)"
                        />
                        {bestSellerError && (
                            <p role="alert" className="text-sm font-bold text-danger">
                                {bestSellerError}
                            </p>
                        )}
                    </div>

                    {/* Native <details>: opening it needs no JS. Open when it has sizes or errors. */}
                    <details open={hasSizes || hasSizeErrors} className="group rounded-2xl border border-border bg-surface p-12">
                        <summary className="flex cursor-pointer list-none items-center gap-6 font-bold [&::-webkit-details-marker]:hidden">
                            <FiChevronLeft aria-hidden="true" className="transition-transform group-open:-rotate-90 ltr:rotate-180" />
                            خيارات إضافية: أحجام بأسعار مختلفة
                        </summary>
                        <div className="mt-12">
                            <SizesEditor
                                sizes={values.sizes}
                                onChange={setSizes}
                                basePrice={values.price}
                                // The product price is the first size's: its error shows there
                                errorFor={(index, field) =>
                                    errorOf(sizeField(index, field)) ?? (index === 0 && field === "priceDelta" ? priceError : undefined)
                                }
                                listError={errorOf("optionGroups")}
                                newRowId={newSizeRowId}
                            />
                        </div>
                    </details>

                    {product && (
                        <button
                            type="button"
                            onClick={() => setIsConfirmingDelete(true)}
                            className="inline-flex h-40 items-center gap-6 self-start rounded-full border border-border px-14 text-sm font-bold text-muted transition-colors hover:border-danger hover:text-danger"
                        >
                            <FiTrash2 aria-hidden="true" />
                            حذف الصنف
                        </button>
                    )}

                    <SaveBar
                        // A new product always offers "أضف الصنف"
                        isDirty={isDirty || !product}
                        isSaving={isSaving}
                        submitLabel={product ? "احفظ" : "أضف الصنف"}
                        onDiscard={() => {
                            setValues(initial);
                            setError(undefined);
                        }}
                    />
                </div>
            </form>

            <ConfirmDialog
                open={isConfirmingDelete}
                title={`حذف ${product?.name ?? "الصنف"}؟`}
                message="رح ينشال من المنيو ومن الأكثر مبيعاً. ما فيك تتراجع عن هالخطوة."
                confirmLabel="إي، احذفه"
                onConfirm={remove}
                onCancel={() => setIsConfirmingDelete(false)}
            />

        </>
    );
};

export default ProductForm;
