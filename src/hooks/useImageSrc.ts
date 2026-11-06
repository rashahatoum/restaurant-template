"use client";

// A src the browser can show: normal paths/URLs pass through; a dashboard
// reference ("local-image:…") becomes its object URL once loaded from
// IndexedDB (undefined meanwhile, and on the server).

import { getImageUrl, isLocalImage, loadImage, subscribeImages } from "@/lib/dashboard/local-images";
import { useEffect, useSyncExternalStore } from "react";

export function useImageSrc(src: string | undefined): string | undefined {
    const isLocal = isLocalImage(src);
    const url = useSyncExternalStore(
        subscribeImages,
        () => (isLocal ? getImageUrl(src) : undefined),
        () => undefined
    );

    // Reading IndexedDB is a side effect: start it after render
    useEffect(() => {
        if (isLocal) loadImage(src);
    }, [isLocal, src]);

    if (!isLocal) return src;
    return url ?? undefined;
}
