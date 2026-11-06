// Used by client components (rows, cart, checkout): imports only the small
// currency config, never restaurantConfig, which would ship it all to the browser.
import { currency } from "@/config/currency";

const numberFormat = new Intl.NumberFormat("en-US");

/** 1250 → "1,250 ل.س" (Latin digits, currency label from the config). */
export function formatPrice(price: number): string {
    return `${numberFormat.format(price)} ${currency.label}`;
}
