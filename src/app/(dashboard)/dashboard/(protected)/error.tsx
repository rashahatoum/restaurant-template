"use client";

import ErrorState from "@/components/dashboard/feedback/ErrorState";
import Link from "next/link";
import { useEffect } from "react";
import { FiRefreshCw } from "react-icons/fi";

// Next.js 16 error boundary: `error` is unknown and `retry` re-renders the segment.
// Unexpected failures only; expected ones (API errors) are Results shown in place.
const DashboardError = ({ error, retry }: { error: unknown; retry: () => void }) => {
    useEffect(() => {
        // Visible in the browser console for debugging; no reporting service yet
        console.error(error);
    }, [error]);

    return (
        <ErrorState
            title="ما قدرنا نفتح هالصفحة"
            message="صار خلل غير متوقع. جرّب مرة تانية، وإذا ضلّت المشكلة ارجع للرئيسية."
            actions={
                <>
                    <button
                        type="button"
                        onClick={retry}
                        className="inline-flex h-44 items-center gap-8 rounded-full bg-primary px-20 font-extrabold text-background transition-opacity hover:opacity-90"
                    >
                        <FiRefreshCw aria-hidden="true" />
                        جرّب مرة تانية
                    </button>
                    <Link
                        href="/dashboard"
                        className="inline-flex h-44 items-center rounded-full border border-border px-20 font-bold transition-colors hover:border-primary hover:text-primary"
                    >
                        الرئيسية
                    </Link>
                </>
            }
        />
    );
};

export default DashboardError;
