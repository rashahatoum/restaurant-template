import Skeleton from "@/components/ui/Skeleton";

// An item page rendered on demand (a new item, or after a dashboard save):
// the same frame as the page (back link, name, the dish, price and the add
// button), instead of the menu's placeholder from the folder above.
const ItemLoading = () => (
    <main aria-busy="true" className="flex h-dvh min-h-640 flex-col items-center px-page-gutter pb-24 pt-88 md:pt-96">
        <p className="sr-only" role="status">
            عم نحمّل الصنف…
        </p>
        <Skeleton className="mb-8 h-20 w-140 self-start rounded-full" />
        <div className="flex w-full min-h-0 flex-1 flex-col items-center justify-center gap-16">
            <Skeleton className="h-36 w-200" />
            <Skeleton className="h-16 w-260 max-w-full" />
            <Skeleton className="aspect-square w-full max-w-320 rounded-full" />
            <Skeleton className="h-32 w-120 rounded-full" />
            <Skeleton className="h-48 w-full max-w-360 rounded-full" />
        </div>
    </main>
);

export default ItemLoading;
