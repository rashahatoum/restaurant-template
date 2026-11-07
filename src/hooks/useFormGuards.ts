"use client";

import type { AppError } from "@/lib/api/errors";
import { useEffect, type RefObject } from "react";

/**
 * What every dashboard form does around saving:
 * - after a failed save, focus the first marked field (keyboard and screen readers land on it);
 * - with unsaved changes, the browser asks before leaving or reloading the page.
 */
export function useFormGuards(formRef: RefObject<HTMLFormElement | null>, error: AppError | undefined, isDirty: boolean) {
    useEffect(() => {
        if (error?.fieldErrors) formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    }, [error, formRef]);

    useEffect(() => {
        if (!isDirty) return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [isDirty]);
}
