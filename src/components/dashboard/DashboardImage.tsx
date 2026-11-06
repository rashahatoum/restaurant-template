"use client";

import { useImageSrc } from "@/hooks/useImageSrc";
import Image from "next/image";
import { MdOutlineRestaurant } from "react-icons/md";

interface DashboardImageProps {
    /** A path, a URL, or a dashboard reference ("local-image:…"). */
    src: string | undefined;
    /** Width of the box, for `sizes` (the box itself is the parent's). */
    sizes: string;
    className: string;
}

// A photo in the dashboard (list rows, pickers). Client leaf: it resolves
// photos added on this device (IndexedDB) to an object URL; next/image skips
// optimization for blob: URLs on its own. Fills its parent (relative box).
const DashboardImage = ({ src, sizes, className }: DashboardImageProps) => {
    const shown = useImageSrc(src);

    if (!shown) {
        return <MdOutlineRestaurant aria-hidden="true" className="absolute inset-0 m-auto size-1/2 text-muted/50" />;
    }
    return <Image src={shown} alt="" fill sizes={sizes} className={className} />;
};

export default DashboardImage;
