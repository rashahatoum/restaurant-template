import { restaurantConfig } from "@/config/restaurant";

const numberFormat = new Intl.NumberFormat("en-US");

/** 1250 → "1,250 ل.س" (Latin digits, currency label from the config). */
export function formatPrice(price: number): string {
    return `${numberFormat.format(price)} ${restaurantConfig.currency.label}`;
}
