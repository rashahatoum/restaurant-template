import { restaurantConfig } from "@/config/restaurant";
import { publicPhones } from "@/lib/site-info";
import { absoluteUrl } from "@/lib/site-url";
import { getSiteInfo } from "@/services/content";

// schema.org Restaurant data for Google (address, phone, hours, menu link):
// one entry per branch, built from the same site info as the footer.
// Server Component; renders a JSON script, nothing visible.
const RestaurantJsonLd = async () => {
    const info = await getSiteInfo();
    const { name, logo, seo, currency } = restaurantConfig;
    const sameAs = info.socialLinks?.map((link) => link.url);

    const branches = info.branches.map((branch) => ({
        "@context": "https://schema.org",
        "@type": "Restaurant",
        "@id": absoluteUrl(`/#branch-${branch.id}`),
        name: `${name} - ${branch.name}`,
        url: absoluteUrl("/"),
        logo: absoluteUrl(logo),
        image: absoluteUrl(seo.shareImage.src),
        description: seo.description,
        telephone: publicPhones(info.phones)[0]?.number,
        address: {
            "@type": "PostalAddress",
            streetAddress: branch.address,
            addressLocality: seo.business.city,
            addressCountry: seo.business.countryCode,
        },
        ...(branch.mapUrl && { hasMap: branch.mapUrl }),
        servesCuisine: seo.business.cuisine,
        hasMenu: absoluteUrl("/menu"),
        currenciesAccepted: currency.code,
        ...(info.openingHoursSchema && { openingHours: info.openingHoursSchema }),
        ...(sameAs?.length && { sameAs }),
    }));

    return (
        <script
            type="application/ld+json"
            // The usual way to inline JSON-LD (Next.js docs). "<" is escaped so
            // no text from the data can close the script tag.
            dangerouslySetInnerHTML={{ __html: JSON.stringify(branches).replace(/</g, "\\u003c") }}
        />
    );
};

export default RestaurantJsonLd;
