// How restaurant info and ordering settings stay in step, pure. Ordering
// points at phones by id (delivery) and at branches (tables, sent to the
// branch's own WhatsApp phone), so an edited number follows by itself; these
// helpers say what orders depend on and keep a save from cutting them off.

import { branchWhatsApp } from "@/lib/site-info";
import type { ContactPhone, SiteInfo } from "@/types/content";
import type { OrderingSettings } from "@/types/order";

/** Whether this branch takes table orders now. */
export const hasDineIn = (ordering: OrderingSettings, branchId: string) =>
    ordering.dineIn.isEnabled &&
    ordering.dineIn.branches.some((setting) => setting.branchId === branchId && setting.isEnabled && setting.tableCount > 0);

/**
 * What orders go to this phone, in plain Arabic ("التوصيل", "طاولات فرع
 * المحوري"); empty when none. A branch phone counts only while it's the
 * branch's WhatsApp number.
 */
export function phoneUses(ordering: OrderingSettings, info: Pick<SiteInfo, "phones" | "branches">, phone: ContactPhone): string[] {
    const uses: string[] = [];
    if (ordering.delivery.isEnabled && ordering.delivery.phoneId === phone.id) uses.push("التوصيل");
    const branch = phone.branchId ? info.branches.find((candidate) => candidate.id === phone.branchId) : undefined;
    if (branch && hasDineIn(ordering, branch.id) && branchWhatsApp(info.phones, branch.id)?.id === phone.id) {
        uses.push(`طاولات ${branch.name}`);
    }
    return uses;
}

/** Why saving `next` would leave orders with no WhatsApp number to go to (empty when fine). */
export function orderingConflicts(ordering: OrderingSettings, next: Pick<SiteInfo, "phones" | "branches">): string[] {
    const conflicts: string[] = [];
    const deliveryPhone = next.phones.find((phone) => phone.id === ordering.delivery.phoneId);
    if (ordering.delivery.isEnabled && !deliveryPhone?.hasWhatsApp) {
        conflicts.push("طلبات التوصيل بدها رقم عليه واتساب: خلّي رقم التوصيل، أو غيّره بدل ما تحذفه.");
    }
    for (const branch of next.branches) {
        if (hasDineIn(ordering, branch.id) && !branchWhatsApp(next.phones, branch.id)) {
            conflicts.push(`طاولات ${branch.name} بدها رقم واتساب تابع للفرع.`);
        }
    }
    return conflicts;
}

/** Ordering after the restaurant info is saved: settings of deleted branches are dropped. */
export function syncOrdering(ordering: OrderingSettings, info: Pick<SiteInfo, "branches">): OrderingSettings {
    const branchIds = new Set(info.branches.map((branch) => branch.id));
    return {
        ...ordering,
        dineIn: { ...ordering.dineIn, branches: ordering.dineIn.branches.filter((setting) => branchIds.has(setting.branchId)) },
    };
}
