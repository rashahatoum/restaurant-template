// The hero feature icons, by the key saved in HeroContent. Shared by the
// public Hero (server) and the dashboard's icon picker; hook-free, so either side can import it.

import type { FeatureIconKey } from "@/types/content";
import type { IconType } from "react-icons";
import { FiAward, FiHeart, FiZap } from "react-icons/fi";
import { LuFlame } from "react-icons/lu";
import { MdDeliveryDining } from "react-icons/md";
import { TiFeather } from "react-icons/ti";

export const FEATURE_ICONS: readonly { key: FeatureIconKey; icon: IconType; label: string }[] = [
    { key: "fresh", icon: TiFeather, label: "طازج" },
    { key: "fire", icon: LuFlame, label: "نار" },
    { key: "quality", icon: FiAward, label: "جودة" },
    { key: "delivery", icon: MdDeliveryDining, label: "توصيل" },
    { key: "fast", icon: FiZap, label: "سرعة" },
    { key: "heart", icon: FiHeart, label: "قلب" },
];

/** The icon for a saved key (the first one if the key is unknown, e.g. an old draft). */
export const featureIcon = (key: FeatureIconKey): IconType =>
    (FEATURE_ICONS.find((option) => option.key === key) ?? FEATURE_ICONS[0]).icon;
