import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import ProductForm from "@/components/dashboard/menu/ProductForm";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "صنف جديد",
};

interface NewProductPageProps {
    searchParams: Promise<{ category?: string }>;
}

// Server page (title, back link); the form is the client part.
const NewProductPage = async ({ searchParams }: NewProductPageProps) => {
    const [seed, { category }] = await Promise.all([getDashboardSeed(), searchParams]);

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader
                back={{ href: `/dashboard/menu${category ? `?category=${encodeURIComponent(category)}` : ""}`, label: "المنيو" }}
                title="صنف جديد"
                description="عبّي الاسم والسعر والقسم، والباقي اختياري. المعاينة بتوريك كيف رح يطلع للزبون."
            />

            <ProductForm seed={seed} initialCategoryId={category} />
        </div>
    );
};

export default NewProductPage;
