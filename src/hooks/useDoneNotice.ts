"use client";

import type { ToastMessage } from "@/hooks/useToast";
import { NOTICE_TEXT, type DoneNotice } from "@/lib/dashboard/notice";
import { useEffect } from "react";

/**
 * Back from a form: says what happened once, then drops ?done=&name= from the
 * URL (a refresh shouldn't repeat it). Native replaceState: Next.js keeps its
 * router in sync without a server round trip.
 */
export function useDoneNotice(notice: DoneNotice | undefined, show: (toast: ToastMessage) => void) {
    // Primitive deps: the object is new on every render
    const done = notice?.done;
    const name = notice?.name;

    useEffect(() => {
        if (!done || !name) return;
        show({ tone: "success", message: NOTICE_TEXT[done](name) });
        const url = new URL(window.location.href);
        url.searchParams.delete("done");
        url.searchParams.delete("name");
        window.history.replaceState(null, "", url);
    }, [done, name, show]);
}
