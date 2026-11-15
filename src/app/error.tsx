"use client";

import PublicErrorState, { primaryActionClasses } from "@/components/ui/PublicErrorState";

// The site's own frame failed (the (site) layout reads the restaurant info for
// the NavBar and the footer). Above every page, so there's no NavBar, no footer
// and no phone number to show here: only a retry. A client component can't
// read the config, so the text stays generic.
const RootError = ({ retry }: { error: Error & { digest?: string }; retry: () => void }) => (
    <PublicErrorState title="الموقع مش متاح هلق" message="صار في مشكلة من عنا. جرّب كمان شوي." underNavBar={false}>
        <button type="button" onClick={() => retry()} className={primaryActionClasses}>
            جرّب مرة تانية
        </button>
    </PublicErrorState>
);

export default RootError;
