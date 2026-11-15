import Skeleton from "@/components/ui/Skeleton";

// Shown while a menu page renders on demand (normally they're served
// prerendered, so this is rare: after a dashboard save, or an hourly refresh).
// The same frame as the page: banner, category cards (4 per row on phones, 6
// from md), the search bar, then item rows with their photo square. No JS;
// the pulse stops with reduced motion.
const MenuLoading = () => (
    <main aria-busy="true" className="pb-120 pt-80 md:pb-140">
        <p className="sr-only" role="status">
            عم نحمّل القائمة…
        </p>

        <div className="px-page-gutter md:pt-24">
            <Skeleton className="mb-24 hidden h-44 w-160 md:block" />
            <Skeleton className="h-184 rounded-[20px] md:h-300 md:rounded-[28px] lg:h-340" />
        </div>

        <div className="mt-16 flex flex-col gap-16 md:mt-24">
            <ul aria-hidden="true" className="grid grid-cols-4 gap-8 px-page-gutter md:grid-cols-6 md:gap-14">
                {Array.from({ length: 8 }, (_, index) => (
                    <li key={index} className={index >= 4 ? "hidden md:block" : undefined}>
                        <Skeleton className="aspect-square rounded-2xl" />
                    </li>
                ))}
            </ul>

            <div className="px-page-gutter">
                <Skeleton className="h-44 rounded-full" />
            </div>

            <div className="flex flex-col gap-10 px-page-gutter">
                <Skeleton className="h-24 w-120" />
                {Array.from({ length: 5 }, (_, index) => (
                    <div
                        key={index}
                        aria-hidden="true"
                        className="flex items-center gap-10 rounded-2xl border border-border p-10 md:gap-14 md:rounded-3xl md:p-14"
                    >
                        <Skeleton className="size-64 shrink-0 md:size-96" />
                        <div className="flex flex-1 flex-col gap-8">
                            <Skeleton className="h-18 w-1/2" />
                            <Skeleton className="h-14 w-3/4" />
                            <Skeleton className="h-16 w-1/4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </main>
);

export default MenuLoading;
