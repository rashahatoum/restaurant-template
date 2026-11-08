// Social platform icons, by the key saved in SiteInfo.socialLinks. Shared by
// the footer (server) and the dashboard form; hook-free.

import type { SocialPlatform } from "@/types/content";
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaThreads, FaTiktok } from "react-icons/fa6";

export const SOCIAL_ICONS: Record<SocialPlatform, IconType> = {
    instagram: FaInstagram,
    facebook: FaFacebookF,
    threads: FaThreads,
    tiktok: FaTiktok,
};
