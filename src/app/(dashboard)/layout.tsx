import type { Metadata } from "next";
import type { ReactNode } from "react";

// The dashboard's own route group: no public NavBar or cart, never indexed.
export const metadata: Metadata = {
    title: { default: "لوحة التحكم", template: "%s | لوحة التحكم" },
    robots: { index: false, follow: false },
};

const DashboardGroupLayout = ({ children }: { children: ReactNode }) => {
    return <div className="min-h-dvh">{children}</div>;
};

export default DashboardGroupLayout;
