import DashboardPageHeader from "@/components/dashboard/DashboardPageHeader";
import MenuEditor from "@/components/dashboard/menu/MenuEditor";
import { readNotice } from "@/lib/dashboard/notice";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "المنيو",
};

interface DashboardMenuPageProps {
    searchParams: Promise<{ category?: string; done?: string; name?: string }>;
}

// Quick edits for every product; each name opens the full form. The product
// form comes back here with ?category=&done=&name= (validated before use).
const DashboardMenuPage = async ({ searchParams }: DashboardMenuPageProps) => {
    const [seed, { category, done, name }] = await Promise.all([getDashboardSeed(), searchParams]);
    const notice = readNotice(done, name);

    return (
        <div className="flex flex-col gap-20">
            <DashboardPageHeader
                back={{ href: "/dashboard", label: "الرئيسية" }}
                title="المنيو"
                description="غيّر السعر، أو علّم الصنف «غير متوفر» لما يخلص. كل تعديل بينحفظ فوراً، وفيك تتراجع عنه."
            />

            <MenuEditor seed={seed} initialCategoryId={category} notice={notice} />
        </div>
    );
};

export default DashboardMenuPage;
