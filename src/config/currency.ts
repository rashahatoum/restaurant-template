import type { RestaurantConfig } from "@/types/config";

// The restaurant's currency, in its own small file because client components
// format prices (lib/format-price). Importing restaurantConfig there would ship
// the whole config to the browser. Edit it here; restaurant.ts re-exports it.
export const currency = {
    code: "SYP",
    label: "ل.س",
} as const satisfies RestaurantConfig["currency"];
