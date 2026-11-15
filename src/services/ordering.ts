// Ordering settings. Visibility rules live here: disabled order types and
// branches are left out; branch names and WhatsApp numbers come from the site
// info (delivery: the chosen phone; tables: the branch's own WhatsApp phone).
//
// Still the mock data, with the mock site info: the table numbers need the
// branch staff phones, which the public `GET /site-info` (D7h) leaves out.
// The ordering step (D7i) reads `GET /ordering`, which resolves them on the server.

import { restaurantConfig } from "@/config/restaurant";
import { ordering } from "@/data/mock/ordering";
import { siteInfo } from "@/data/mock/site-info";
import { branchWhatsApp } from "@/lib/site-info";
import type { OrderingOptions } from "@/types/order";

/** Cache tag of the public ordering read; a site-info save refreshes it too (numbers, branches). */
export const ORDERING_TAG = "ordering";

export async function getOrderingOptions(): Promise<OrderingOptions> {
    const { branches, phones } = siteInfo;
    const { delivery, dineIn, message, thankYou } = ordering;

    const dineInBranches = dineIn.isEnabled
        ? dineIn.branches.flatMap((setting) => {
              const branch = branches.find((candidate) => candidate.id === setting.branchId);
              const phone = branch && branchWhatsApp(phones, branch.id);
              return branch && phone && setting.isEnabled && setting.tableCount > 0
                  ? [{ id: branch.id, name: branch.name, tableCount: setting.tableCount, whatsApp: phone.number }]
                  : [];
          })
        : [];

    // Off as well when its phone is gone or has no WhatsApp (orders couldn't be sent)
    const deliveryPhone = phones.find((phone) => phone.id === delivery.phoneId && phone.hasWhatsApp);

    return {
        delivery: delivery.isEnabled && deliveryPhone ? { fee: delivery.fee, whatsApp: deliveryPhone.number } : null,
        dineInBranches,
        message,
        thankYou,
        restaurantName: restaurantConfig.name,
        timeZone: restaurantConfig.timeZone,
    };
}
