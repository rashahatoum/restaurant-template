import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import ProductForm from "@/components/dashboard/menu/ProductForm";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "تعديل صنف",
};

interface EditProductPageProps {
    params: Promise<{ id: string }>;
}

// Server page (title, back link); the form is the client part. The product
// itself is looked up in the form: it may exist only in this browser's draft.
const EditProductPage = async ({ params }: EditProductPageProps) => {
    const [seed, { id }] = await Promise.all([getDashboardSeed(), params]);
    // Back to the product's tab when the server knows it (not for products made on this device)
    const category = seed.products.find((product) => product.id === id)?.categoryId;

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader
                back={{ href: `/dashboard/menu${category ? `?category=${encodeURIComponent(category)}` : ""}`, label: "المنيو" }}
                title="تعديل الصنف"
            />

            <ProductForm seed={seed} productId={id} />
        </div>
    );
};

export default EditProductPage;
