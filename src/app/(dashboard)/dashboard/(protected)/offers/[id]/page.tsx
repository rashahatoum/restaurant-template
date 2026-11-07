import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import OfferForm from "@/components/dashboard/offers/OfferForm";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "تعديل عرض",
};

interface EditOfferPageProps {
    params: Promise<{ id: string }>;
}

// Server page; the offer is looked up in the form (it may exist only in this browser's draft).
const EditOfferPage = async ({ params }: EditOfferPageProps) => {
    const [seed, { id }] = await Promise.all([getDashboardSeed(), params]);

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader back={{ href: "/dashboard/offers", label: "العروض" }} title="تعديل العرض" />

            <OfferForm seed={seed} offerId={id} />
        </div>
    );
};

export default EditOfferPage;
