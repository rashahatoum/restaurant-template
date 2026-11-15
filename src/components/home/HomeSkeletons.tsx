import Skeleton from "@/components/ui/Skeleton";

// Placeholders for the home sections while their data loads (Suspense
// fallbacks in the home page). Same outer sizes as the real sections (section
// padding, title, the Slider's centre slide and arrows), so nothing jumps
// when the content arrives. Hook-free Server Components.

/** SectionTitle: eyebrow, a two-word display heading, the «عرض الكل» link. */
const TitleSkeleton = ({ hasAction }: { hasAction: boolean }) => (
    <div className="mb-40 flex flex-col items-center gap-12 md:mb-64">
        <Skeleton className="h-20 w-120 rounded-full" />
        <Skeleton className="h-44 w-220 lg:h-56 lg:w-280" />
        {hasAction && <Skeleton className="mt-8 h-20 w-80 rounded-full" />}
    </div>
);

/** The Slider's centre slide (same width rules) and its arrows row. */
const SlideSkeleton = ({ children }: { children: React.ReactNode }) => (
    <>
        <div className="mx-auto flex w-[75%] max-w-360 flex-col gap-12 md:w-[28%] md:max-w-none">{children}</div>
        <div className="mt-30 flex justify-center gap-16">
            <Skeleton className="size-48 rounded-full" />
            <Skeleton className="size-48 rounded-full" />
        </div>
    </>
);

/** A home section's frame: same padding as the real one, announced once as loading. */
const SectionFrame = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <section aria-busy="true" aria-label={label} className="isolate px-page-gutter py-56 md:py-80">
        <p className="sr-only" role="status">
            عم نحمّل {label}…
        </p>
        {children}
    </section>
);

/** «الأكثر مبيعاً»: square dish photo, name, description, price. */
export const BestSellersSkeleton = () => (
    <SectionFrame label="الأكثر مبيعاً">
        <TitleSkeleton hasAction />
        <SlideSkeleton>
            <Skeleton className="aspect-square w-full rounded-full" />
            <Skeleton className="mx-auto h-24 w-3/5" />
            <Skeleton className="mx-auto h-16 w-4/5" />
            <Skeleton className="mx-auto h-28 w-2/5 rounded-full" />
        </SlideSkeleton>
    </SectionFrame>
);

/** Offers: 4:3 photo card with title, items and price. */
export const OffersSkeleton = () => (
    <SectionFrame label="العروض">
        <TitleSkeleton hasAction />
        <SlideSkeleton>
            <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
            <Skeleton className="h-24 w-3/5" />
            <Skeleton className="h-16 w-4/5" />
            <Skeleton className="h-40 w-full rounded-full" />
        </SlideSkeleton>
    </SectionFrame>
);

/** Reviews: a WhatsApp-style chat card (question, answer). */
export const ReviewsSkeleton = () => (
    <SectionFrame label="آراء الزباين">
        <TitleSkeleton hasAction={false} />
        <SlideSkeleton>
            <Skeleton className="h-320 w-full rounded-3xl" />
        </SlideSkeleton>
    </SectionFrame>
);

/** «من نحن»: photo and text side by side from md, stacked on phones. */
export const AboutSkeleton = () => (
    <SectionFrame label="من نحن">
        <div className="grid items-center gap-40 md:grid-cols-2 md:gap-64 lg:gap-96">
            <Skeleton className="order-1 mx-auto aspect-4/5 w-full max-w-380 rounded-3xl md:order-2 md:max-w-520" />
            <div className="flex flex-col gap-12">
                <Skeleton className="h-20 w-120 rounded-full" />
                <Skeleton className="h-44 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-5/6" />
                <Skeleton className="h-16 w-2/3" />
            </div>
        </div>
    </SectionFrame>
);
