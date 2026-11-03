"use client";

// One toast at a time: a new one replaces the last. Hides itself after a few
// seconds; long enough to reach "تراجع".

import type { FeedbackTone } from "@/components/dashboard/feedback/FormAlert";
import { useCallback, useEffect, useRef, useState } from "react";

export interface ToastMessage {
    tone: FeedbackTone;
    message: string;
    action?: { label: string; onClick: () => void };
}

const DURATION_MS = 5000;

export function useToast() {
    const [toast, setToast] = useState<(ToastMessage & { id: number }) | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

    const hide = useCallback(() => {
        clearTimeout(timer.current);
        setToast(null);
    }, []);

    const show = useCallback((next: ToastMessage) => {
        clearTimeout(timer.current);
        setToast({ ...next, id: Date.now() });
        timer.current = setTimeout(() => setToast(null), DURATION_MS);
    }, []);

    // No timer left running after the screen goes away
    useEffect(() => () => clearTimeout(timer.current), []);

    return { toast, show, hide };
}
