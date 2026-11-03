import MenuEditor from "@/components/dashboard/menu/MenuEditor";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

export const metadata: Metadata = {
    title: "المنيو",
};

// Quick edits for every product. The full product form comes in D2.
const DashboardMenuPage = async () => {
    const seed = await getDashboardSeed();

    return (
        <div className="flex flex-col gap-20">
            <div>
                <Link
                    href="/dashboard"
                    className="mb-10 inline-flex items-center gap-6 text-sm font-bold text-primary hover:underline"
                >
                    <FiArrowRight aria-hidden="true" className="ltr:rotate-180" />
                    الرئيسية
                </Link>
                <h1 className="font-display text-2xl font-bold md:text-3xl">المنيو</h1>
                <p className="mt-6 text-sm text-muted">
                    غيّر السعر، أو علّم الصنف «غير متوفر» لما يخلص. كل تعديل بينحفظ فوراً، وفيك تتراجع عنه.
                </p>
            </div>

            <MenuEditor seed={seed} />
        </div>
    );
};

export default DashboardMenuPage;
