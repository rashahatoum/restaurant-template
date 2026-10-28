// Contact & location info for Ahl Al Karam. Only src/services/ may import this file.
// Phones, branches and hours come from the owner.

import type { SiteInfo } from "@/types/content";

export const siteInfo: SiteInfo = {
    // \n = line break (the footer keeps it)
    tagline:
        "شاورما بطعم أصيل من قلب السويداء،\nبخبرة شيفنا وكرم أهل الجبل.",
    phones: [
        { number: "+963930539614", hasWhatsApp: true },
        { number: "+963980785608", hasWhatsApp: true },
    ],
    branches: [
        {
            id: "qanawat-road",
            name: "فرع طريق قنوات",
            address: "السويداء، طريق قنوات، مقابل مشفى المزرعة",
        },
        {
            id: "al-mehwari",
            name: "فرع المحوري",
            address: "السويداء، المحوري، مقابل كازية سرايا",
        },
    ],
    openingHours: "يومياً من 9 الصبح لـ 12 بالليل",
};
