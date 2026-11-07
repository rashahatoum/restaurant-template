"use client";

import type { Result } from "@/lib/api/errors";
import { useRef, useState } from "react";

/**
 * Runs a form's save once at a time. A double tap on "احفظ" fires two submit
 * events before React re-renders the disabled button, so a state flag alone
 * lets both through (the owner got every new slide twice); a ref doesn't.
 * After a success the lock stays on: the form is leaving for the list.
 */
export function useSingleSubmit() {
    const isRunning = useRef(false);
    const [isSaving, setIsSaving] = useState(false);

    const run = async <T>(save: () => Promise<Result<T>>): Promise<Result<T> | undefined> => {
        if (isRunning.current) return undefined;
        isRunning.current = true;
        setIsSaving(true);

        const result = await save();
        if (!result.ok) {
            isRunning.current = false;
            setIsSaving(false);
        }
        return result;
    };

    return { isSaving, run };
}
