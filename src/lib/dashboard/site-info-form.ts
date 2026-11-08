// The restaurant info form's values, pure: what the fields hold and the
// SiteInfo the repository saves (the API payload later).

import { formatPhone, normalizePhone } from "@/lib/contact";
import { hoursSchema, hoursText, normalizeSocialUrl, parseHoursSchema, SOCIAL_PLATFORMS } from "@/lib/site-info";
import type { SiteInfo, SocialPlatform } from "@/types/content";

export interface PhoneValues {
    /** React key: stays put when a row above is deleted. */
    key: number;
    /** Empty for a new number (the repository gives it one). */
    id: string;
    /** As typed; normalized when saved. */
    number: string;
    hasWhatsApp: boolean;
    /** The branch it belongs to (floor staff), or empty for the restaurant's own number. */
    branchId: string;
}

export interface BranchValues {
    key: number;
    /** Empty for a new branch. */
    id: string;
    name: string;
    address: string;
    mapUrl: string;
}

export interface SiteInfoFormValues {
    tagline: string;
    phones: PhoneValues[];
    branches: BranchValues[];
    /** "HH:MM" clock values, or empty. */
    opens: string;
    closes: string;
    social: Record<SocialPlatform, string>;
}

export function toSiteInfoFormValues(info: SiteInfo): SiteInfoFormValues {
    const hours = parseHoursSchema(info.openingHoursSchema);
    const social = Object.fromEntries(SOCIAL_PLATFORMS.map(({ platform }) => [platform, ""])) as Record<SocialPlatform, string>;
    for (const link of info.socialLinks ?? []) social[link.platform] = link.url;

    return {
        tagline: info.tagline,
        phones: info.phones.map((phone, key) => ({
            key,
            id: phone.id,
            number: formatPhone(phone.number),
            hasWhatsApp: phone.hasWhatsApp,
            branchId: phone.branchId ?? "",
        })),
        branches: info.branches.map((branch, key) => ({
            key,
            id: branch.id,
            name: branch.name,
            address: branch.address,
            mapUrl: branch.mapUrl ?? "",
        })),
        opens: hours?.opens ?? "",
        closes: hours?.closes ?? "",
        social,
    };
}

/** A typed link without "https://" gets it; anything else stays as typed (the rules report it). */
const withHttps = (text: string) => (text && !/^[a-z]+:\/\//i.test(text) ? `https://${text}` : text);

/** Only one of the two clock times set: the form says so before saving. */
export const isHalfHours = (values: Pick<SiteInfoFormValues, "opens" | "closes">) => Boolean(values.opens) !== Boolean(values.closes);

export function toSiteInfoInput(values: SiteInfoFormValues): SiteInfo {
    const hasHours = Boolean(values.opens && values.closes);
    const socialLinks = SOCIAL_PLATFORMS.flatMap(({ platform }) => {
        const typed = values.social[platform].trim();
        return typed ? [{ platform, url: normalizeSocialUrl(platform, typed) ?? typed }] : [];
    });

    return {
        tagline: values.tagline.trim(),
        phones: values.phones.map((phone) => ({
            id: phone.id,
            number: normalizePhone(phone.number) ?? phone.number.trim(),
            hasWhatsApp: phone.hasWhatsApp,
            ...(phone.branchId ? { branchId: phone.branchId } : {}),
        })),
        branches: values.branches.map((branch) => {
            const mapUrl = withHttps(branch.mapUrl.trim());
            return {
                id: branch.id,
                name: branch.name.trim(),
                address: branch.address.trim(),
                ...(mapUrl ? { mapUrl } : {}),
            };
        }),
        ...(hasHours
            ? { openingHours: hoursText(values.opens, values.closes), openingHoursSchema: hoursSchema(values.opens, values.closes) }
            : {}),
        ...(socialLinks.length > 0 ? { socialLinks } : {}),
    };
}

export const isSameSiteInfo = (a: SiteInfo, b: SiteInfo) => JSON.stringify(a) === JSON.stringify(b);
