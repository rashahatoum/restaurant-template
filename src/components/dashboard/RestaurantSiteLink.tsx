import { restaurantConfig } from "@/config/restaurant";
import Image from "next/image";
import { FiExternalLink } from "react-icons/fi";

// Which restaurant this dashboard edits: its logo (the name is part of it,
// so no text beside it; owner), linking to its public site in a new tab so
// the dashboard stays open. Screen readers get the name from the label.
const RestaurantSiteLink = () => {
    return (
        <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${restaurantConfig.name}: افتح الموقع (بتبويب جديد)`}
            className="group inline-flex items-center gap-6 rounded-full"
        >
            <Image
                src={restaurantConfig.logo}
                alt=""
                width={120}
                height={40}
                className="h-auto w-104 transition-opacity group-hover:opacity-80"
            />
            <FiExternalLink aria-hidden="true" className="shrink-0 text-sm text-muted group-hover:text-primary" />
        </a>
    );
};

export default RestaurantSiteLink;
