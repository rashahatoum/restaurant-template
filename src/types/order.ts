// Ordering settings (dashboard-editable) and the order the customer sends.
// Orders go out as a WhatsApp message; nothing is stored.

import type { Branch } from "@/types/content";

/** Texts may use {restaurant} and {name}. */
export interface OrderMessageTemplate {
    /** First line, in the customer's voice ("مرحبا {restaurant}، بدي اطلب:"). */
    greeting: string;
    /** Last line, in the customer's voice. */
    closing: string;
}

export interface OrderingSettings {
    delivery: {
        isEnabled: boolean;
        /** Added to the order total, in the restaurant currency. */
        fee: number;
        /** International format, receives delivery orders. */
        whatsApp: string;
    };
    dineIn: {
        isEnabled: boolean;
        branches: readonly {
            branchId: Branch["id"];
            isEnabled: boolean;
            /** Tables are numbered 1…tableCount. */
            tableCount: number;
            /** Receives this branch's table orders. */
            whatsApp: string;
        }[];
    };
    message: OrderMessageTemplate;
    /** Shown on the site after WhatsApp opens, in the restaurant's voice. */
    thankYou: string;
}

/** What the checkout form needs: only enabled order types, branch names resolved. */
export interface OrderingOptions {
    delivery: { fee: number; whatsApp: string } | null;
    dineInBranches: readonly { id: string; name: string; tableCount: number; whatsApp: string }[];
    message: OrderMessageTemplate;
    thankYou: string;
}

export type OrderDetails =
    | { type: "delivery"; name: string; phone: string; address: string }
    | { type: "dineIn"; name: string; branchName: string; tableNumber: number };
