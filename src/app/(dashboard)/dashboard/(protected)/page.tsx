import DashboardHome from "@/components/dashboard/DashboardHome";
import RestaurantSiteLink from "@/components/dashboard/RestaurantSiteLink";
import { getSession } from "@/lib/auth/session";
import { getDashboardSeed } from "@/services/dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "الرئيسية",
};

// Welcome + task tiles. The tiles are a client component: their counts
// include the owner's edits on this device.
const DashboardHomePage = async () => {
    const [session, seed] = await Promise.all([getSession(), getDashboardSeed()]);

    return (
        <div className="flex flex-col gap-24">
            <div>
                {/* The restaurant being edited, above the welcome (owner); links to its site */}
                <div className="mb-14">
                    <RestaurantSiteLink />
                </div>
                <h1 className="font-display text-2xl font-bold md:text-3xl">أهلاً {session?.name}</h1>
                <p className="mt-6 text-muted">شو بدك تعدّل اليوم؟</p>
            </div>

            <DashboardHome seed={seed} />
        </div>
    );
};

export default DashboardHomePage;
