"use client";

import PublicErrorState, { primaryActionClasses, secondaryActionClasses } from "@/components/ui/PublicErrorState";

// The menu couldn't be loaded and there's no earlier copy to show (a
// background refresh that fails keeps the last good page instead). Client
// component, as every error boundary: it can't read the phone numbers, but the
// footer with «تواصل معنا» stays visible (it's in the (site) layout), so the
// page points there.
const MenuError = ({ retry }: { error: Error & { digest?: string }; retry: () => void }) => (
    <PublicErrorState title="القائمة مش متاحة هلق، اطلب على الواتساب" message="رقمنا تحت بـ«تواصل معنا». أو جرّب كمان شوي.">
        <a href="#contact" className={primaryActionClasses}>
            تواصل معنا
        </a>
        <button type="button" onClick={() => retry()} className={secondaryActionClasses}>
            جرّب مرة تانية
        </button>
    </PublicErrorState>
);

export default MenuError;
