// Share texts, built on the server (they use the restaurant config and the site URL).

import { restaurantConfig } from "@/config/restaurant";
import { absoluteUrl } from "@/lib/site-url";
import type { MenuItemDetails } from "@/types/menu";

/** WhatsApp message for sharing a dish: its name, the restaurant, its link. */
export function itemShareText(item: Pick<MenuItemDetails, "id" | "name">): string {
    return `شوف ${item.name} من ${restaurantConfig.name} 😋\n${absoluteUrl(`/menu/${item.id}`)}`;
}
