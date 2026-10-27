import type { ReactNode } from "react";
import type { IconType } from "react-icons";

interface BadgeProps {
    children: ReactNode;
    icon?: IconType;
}

// Small pill label (e.g. over an image). Position it from the parent.
const Badge = ({ children, icon: Icon }: BadgeProps) => {
    return (
        <span className="inline-flex items-center gap-8 rounded-full bg-background/80 px-16 py-8 text-sm font-bold text-foreground backdrop-blur-sm md:text-base">
            {Icon && <Icon aria-hidden="true" className="text-lg text-primary" />}
            {children}
        </span>
    );
};

export default Badge;
