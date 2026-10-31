import ItemDetails from "@/components/menu/ItemDetails";
import { restaurantConfig } from "@/config/restaurant";
import { getMenuItem, getMenuItemIds } from "@/services/menu";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowRight } from "react-icons/fi";

interface ItemPageProps {
    params: Promise<{ itemId: string }>;
}

// Every product and active offer is prerendered.
export async function generateStaticParams() {
    const ids = await getMenuItemIds();
    return ids.map((itemId) => ({ itemId }));
}

export async function generateMetadata({ params }: ItemPageProps): Promise<Metadata> {
    const item = await getMenuItem((await params).itemId);
    if (!item) return {};

    const description =
        item.description ??
        `${item.parts.join("، ")}${item.freeItem ? ` + ${item.freeItem} مجاناً` : ""}`;

    return {
        title: item.name,
        description: `${description} من ${restaurantConfig.name}.`,
        openGraph: item.image ? { images: [{ url: item.image, alt: item.name }] } : undefined,
    };
}

// Standalone page: opened from a shared link, a refresh, or a new tab.
// Clicks inside the site open the same content in a modal instead
// (app/(site)/@modal/(.)menu/[itemId]).
const ItemPage = async ({ params }: ItemPageProps) => {
    const item = await getMenuItem((await params).itemId);
    if (!item) notFound();

    return (
        // pt: the NavBar is absolutely positioned over the page top
        // One screen tall, like the modal (min height for very short screens)
        <main className="flex h-dvh min-h-640 flex-col px-page-gutter pb-24 pt-88 md:pt-96">
            <Link
                href="/menu"
                className="mb-8 inline-flex shrink-0 items-center gap-6 self-start text-sm font-bold text-primary hover:underline"
            >
                <FiArrowRight aria-hidden="true" />
                العودة لقائمة الطعام
            </Link>

            <div className="min-h-0 flex-1">
                <ItemDetails item={item} headingLevel="h1" preloadImage />
            </div>
        </main>
    );
};

export default ItemPage;
