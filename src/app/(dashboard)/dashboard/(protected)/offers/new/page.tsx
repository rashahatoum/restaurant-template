import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import OfferForm from "@/components/dashboard/offers/OfferForm";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "عرض جديد",
};

// Server page (title, back link); the form is the client part.
const NewOfferPage = async () => {
    const seed = await getDashboardSeed();

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader
                back={{ href: "/dashboard/offers", label: "العروض" }}
                title="عرض جديد"
                description="كل الحقول لازمة إلا الشارة. المعاينة بتوريك الكرت متل ما رح يطلع للزبون."
            />

            <OfferForm seed={seed} />
        </div>
    );
};

export default NewOfferPage;
