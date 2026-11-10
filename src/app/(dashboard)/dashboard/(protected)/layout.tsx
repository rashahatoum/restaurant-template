import { logout } from "@/app/(dashboard)/dashboard/actions";
import { platformConfig } from "@/config/platform";
import { getSession } from "@/lib/auth/session";
import { LOGIN_PATH } from "@/lib/auth/paths";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { FiInfo, FiLogOut } from "react-icons/fi";

// Every signed-in dashboard page. The proxy already sent signed-out visitors
// to the login; this checks again on the server (the proxy is only a fast filter).
const ProtectedLayout = async ({ children }: { children: ReactNode }) => {
    const session = await getSession();
    if (!session) redirect(LOGIN_PATH);

    return (
        <div className="flex min-h-dvh flex-col">
            {/* Only the page content prints (the QR sheets) */}
            <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm print:hidden">
                <div className="mx-auto flex h-76 max-w-960 items-center justify-between gap-12 px-16">
                    {/* The product's logo leads; it's the dashboard home */}
                    <Link href="/dashboard" aria-label={`${platformConfig.name}: لوحة التحكم`} className="shrink-0">
                        <Image
                            src={platformConfig.logo.src}
                            alt=""
                            width={platformConfig.logo.width}
                            height={platformConfig.logo.height}
                            sizes="140px"
                            // Wide logo: sized by height, width follows
                            className="h-48 w-auto"
                            preload
                        />
                    </Link>

                    <form action={logout} className="shrink-0">
                        <button
                            type="submit"
                            aria-label="خروج"
                            className="flex size-40 items-center justify-center gap-6 rounded-full border border-border text-sm font-bold text-muted transition-colors hover:border-primary hover:text-primary md:w-auto md:px-14"
                        >
                            <FiLogOut aria-hidden="true" />
                            <span className="hidden md:inline">خروج</span>
                        </button>
                    </form>
                </div>
            </header>

            {/* Honest about where edits go until the Laravel API is connected */}
            <p className="flex items-center justify-center gap-6 border-b border-border bg-warning/10 px-16 py-8 text-center text-xs font-bold text-warning print:hidden">
                <FiInfo aria-hidden="true" className="shrink-0" />
                نسخة تجريبية: التعديلات بتنحفظ على هالجهاز بس، وما بتوصل للزباين.
            </p>

            <main className="mx-auto w-full max-w-960 flex-1 px-16 py-24 md:py-32 print:max-w-none print:p-0">{children}</main>
        </div>
    );
};

export default ProtectedLayout;
