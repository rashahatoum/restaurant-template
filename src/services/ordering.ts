// Ordering settings. Visibility rules live here: disabled order types and
// branches are left out, and branch names come from the site info.

import { ordering } from "@/data/mock/ordering";
import { getSiteInfo } from "@/services/content";
import type { OrderingOptions } from "@/types/order";

export async function getOrderingOptions(): Promise<OrderingOptions> {
    const { branches } = await getSiteInfo();
    const { delivery, dineIn, message, thankYou } = ordering;

    const dineInBranches = dineIn.isEnabled
        ? dineIn.branches.flatMap((setting) => {
              const branch = branches.find((candidate) => candidate.id === setting.branchId);
              return branch && setting.isEnabled && setting.tableCount > 0
                  ? [
                        {
                            id: branch.id,
                            name: branch.name,
                            tableCount: setting.tableCount,
                            whatsApp: setting.whatsApp,
                        },
                    ]
                  : [];
          })
        : [];

    return {
        delivery: delivery.isEnabled ? { fee: delivery.fee, whatsApp: delivery.whatsApp } : null,
        dineInBranches,
        message,
        thankYou,
    };
}
