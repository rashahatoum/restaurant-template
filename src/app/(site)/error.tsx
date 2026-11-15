"use client";

import PublicErrorState, { primaryActionClasses, secondaryActionClasses } from "@/components/ui/PublicErrorState";

// A public page (home, cart) couldn't be loaded and there's no earlier copy to
// show: the server's data didn't come (a background refresh that fails keeps
// the last good page instead). The NavBar and the footer with «تواصل معنا»
// stay (they're in the (site) layout, above this boundary). The menu has its own.
const SiteError = ({ retry }: { error: Error & { digest?: string }; retry: () => void }) => (
    <PublicErrorState title="ما قدرنا نحمّل الصفحة هلق" message="جرّب كمان شوي. وإذا مستعجل، رقمنا تحت بـ«تواصل معنا» واطلب على الواتساب.">
        <button type="button" onClick={() => retry()} className={primaryActionClasses}>
            جرّب مرة تانية
        </button>
        <a href="#contact" className={secondaryActionClasses}>
            تواصل معنا
        </a>
    </PublicErrorState>
);

export default SiteError;
