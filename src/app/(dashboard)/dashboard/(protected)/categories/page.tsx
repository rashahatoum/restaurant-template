import CategoriesEditor from "@/components/dashboard/categories/CategoriesEditor";
import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "الأقسام",
};

// Server page (title, back link); the editor is the client part.
const CategoriesPage = async () => {
    const seed = await getDashboardSeed();

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader
                back={{ href: "/dashboard/menu", label: "المنيو" }}
                title="الأقسام"
                description="الترتيب هون هو ترتيب الأقسام بالمنيو. اكبس على اسم القسم لتغيّره."
            />

            <CategoriesEditor seed={seed} />
        </div>
    );
};

export default CategoriesPage;
