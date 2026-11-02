import { absoluteUrl } from "@/lib/site-url";
import { getMenuItemIds } from "@/services/menu";
import type { MetadataRoute } from "next";

// Public, indexable pages: home, the menu, and every product/offer page
// (same ids as their generateStaticParams). /cart is noindex; /lab is dev-only.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const itemIds = await getMenuItemIds();

    return [
        { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
        { url: absoluteUrl("/menu"), changeFrequency: "weekly", priority: 0.9 },
        ...itemIds.map((id) => ({
            url: absoluteUrl(`/menu/${id}`),
            changeFrequency: "monthly" as const,
            priority: 0.6,
        })),
    ];
}
