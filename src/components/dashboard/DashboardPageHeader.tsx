import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

interface DashboardPageHeaderProps {
    /** Where "back" goes, e.g. the menu list. */
    back: { href: string; label: string };
    title: string;
    description?: string;
}

// The top of every inner dashboard page: back link, title, one line of help.
// Server Component (static).
const DashboardPageHeader = ({ back, title, description }: DashboardPageHeaderProps) => {
    return (
        <div>
            <Link href={back.href} className="mb-10 inline-flex items-center gap-6 text-sm font-bold text-primary hover:underline">
                <FiArrowRight aria-hidden="true" className="ltr:rotate-180" />
                {back.label}
            </Link>
            <h1 className="font-display text-2xl font-bold md:text-3xl">{title}</h1>
            {description && <p className="mt-6 text-sm text-muted">{description}</p>}
        </div>
    );
};

export default DashboardPageHeader;
