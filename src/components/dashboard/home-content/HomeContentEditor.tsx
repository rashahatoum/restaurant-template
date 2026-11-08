"use client";

import ToastViewport from "@/components/dashboard/feedback/ToastViewport";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useToast } from "@/hooks/useToast";
import type { DashboardData } from "@/types/dashboard";
import AboutForm from "./AboutForm";
import HeroForm from "./HeroForm";

const sectionHeadingClasses = "text-lg font-extrabold";

// The hero and «من نحن» forms on one page, each saved on its own. They wait
// for the browser draft (initial values are taken once) and remount with the
// saved values after a save or a reset (key = the saved content).
const HomeContentEditor = ({ seed }: { seed: DashboardData }) => {
    const { hero, about } = useDashboardData(seed);
    const isHydrated = useIsHydrated();
    const { toast, show, hide } = useToast();

    if (!isHydrated) return <div aria-busy="true" className="min-h-480" />;

    return (
        <>
            <section aria-labelledby="hero-heading" className="flex flex-col gap-14">
                <div className="flex flex-col gap-4">
                    <h2 id="hero-heading" className={sectionHeadingClasses}>
                        الواجهة
                    </h2>
                    <p className="text-sm text-muted">أول شي بيشوفه الزبون بالموقع، فوق صورة السيخ.</p>
                </div>
                <HeroForm
                    key={JSON.stringify(hero)}
                    hero={hero}
                    onSaved={() => show({ tone: "success", message: "انحفظت الواجهة" })}
                />
            </section>

            <hr className="border-border" />

            <section aria-labelledby="about-heading" className="flex flex-col gap-14">
                <div className="flex flex-col gap-4">
                    <h2 id="about-heading" className={sectionHeadingClasses}>
                        من نحن
                    </h2>
                    <p className="text-sm text-muted">قصة المطعم بالرئيسية، جنب صورة.</p>
                </div>
                <AboutForm
                    key={JSON.stringify(about)}
                    about={about}
                    onSaved={() => show({ tone: "success", message: "انحفظ «من نحن»" })}
                />
            </section>

            <ToastViewport toast={toast} onClose={hide} />
        </>
    );
};

export default HomeContentEditor;
