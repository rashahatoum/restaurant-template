import Link from "next/link";
import type { IconType } from "react-icons";
import { FiChevronLeft } from "react-icons/fi";

interface DashboardTileProps {
    title: string;
    /** One line of counts, e.g. "16 صنف · 1 غير متوفر". */
    summary: string;
    icon: IconType;
    /** Without it the tile shows "قريباً" (screen not built yet). */
    href?: string;
}

// A task on the dashboard home: what it is, what's there now, where to go.
const DashboardTile = ({ title, summary, icon: Icon, href }: DashboardTileProps) => {
    const content = (
        <>
            <span className="flex size-48 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-2xl text-primary">
                <Icon aria-hidden="true" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="text-base font-extrabold">{title}</span>
                <span className="truncate text-sm text-muted">{summary}</span>
            </span>
            {href ? (
                <FiChevronLeft aria-hidden="true" className="shrink-0 text-xl text-muted ltr:rotate-180" />
            ) : (
                <span className="shrink-0 rounded-full border border-border px-8 py-2 text-xs font-bold text-muted">
                    قريباً
                </span>
            )}
        </>
    );

    const classes = "flex min-h-76 items-center gap-12 rounded-2xl border border-border bg-surface p-14";

    return href ? (
        <Link href={href} className={`${classes} transition-colors hover:border-primary`}>
            {content}
        </Link>
    ) : (
        <div className={`${classes} opacity-70`}>{content}</div>
    );
};

export default DashboardTile;
