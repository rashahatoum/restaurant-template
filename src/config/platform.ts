// The product behind every restaurant site. Unlike restaurant.ts, this stays
// the same when the template is deployed for another restaurant.
export const platformConfig = {
    name: "Tfaddal Menu",
    /**
     * The dashboard's main logo (for dark backgrounds). To change it: put the
     * new image in public/assets/imgs/ and update src, width and height here.
     */
    logo: { src: "/assets/imgs/tfaddal-menu-logo.webp", width: 800, height: 333 },
    /** Set once the product has its own site; the footer credit then links to it. */
    url: undefined as string | undefined,
    /** Sales/support WhatsApp, linked next to the footer credit. */
    whatsapp: "+963930539614",
};
