import { absoluteUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

// Everything public is crawlable except the personal cart and the dev-only lab.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: "*", allow: "/", disallow: ["/cart", "/lab/"] },
        sitemap: absoluteUrl("/sitemap.xml"),
    };
}
