import LoginForm from "@/components/dashboard/LoginForm";
import RestaurantSiteLink from "@/components/dashboard/RestaurantSiteLink";
import { platformConfig } from "@/config/platform";
import { restaurantConfig } from "@/config/restaurant";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "تسجيل الدخول",
};

interface LoginPageProps {
    searchParams: Promise<{ next?: string | string[] }>;
}

// Outside the protected layout. The proxy sends signed-in users to the dashboard.
const LoginPage = async ({ searchParams }: LoginPageProps) => {
    const { next } = await searchParams;

    return (
        <main className="flex min-h-dvh items-center justify-center px-16 py-40">
            <div className="flex w-full max-w-380 flex-col gap-24 rounded-3xl border border-border bg-surface p-24 md:p-32">
                <header className="flex flex-col items-center gap-14 text-center">
                    {/* The product's logo leads the dashboard */}
                    <Image
                        src={platformConfig.logo.src}
                        alt={platformConfig.name}
                        width={platformConfig.logo.width}
                        height={platformConfig.logo.height}
                        sizes="260px"
                        className="h-auto w-240"
                        preload
                    />
                    <h1 className="sr-only">لوحة تحكم {restaurantConfig.name}</h1>
                    {/* The restaurant as the title, linking to its site */}
                    <RestaurantSiteLink />
                    <p className="text-sm text-muted">سجّل دخول لتعدّل المنيو والعروض ومحتوى الموقع.</p>
                </header>

                <LoginForm next={typeof next === "string" ? next : undefined} />
            </div>
        </main>
    );
};

export default LoginPage;
