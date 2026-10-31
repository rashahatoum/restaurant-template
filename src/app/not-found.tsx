import Footer from "@/components/layout/Footer";
import NavBar from "@/components/layout/NavBar";
import { getNavContact } from "@/services/content";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "الصفحة غير موجودة",
    // Overrides the root layout's "index, follow" so it doesn't contradict
    // the noindex tag Next.js adds to 404 responses.
    robots: { index: false },
};

// Root not-found: handles every unmatched URL. It renders in the root layout,
// outside (site)/layout, so it adds the NavBar and Footer itself.
const NotFound = async () => {
    const navContact = await getNavContact();

    return (
        <>
            <NavBar {...navContact} />

            <main className="flex min-h-dvh flex-col items-center justify-center gap-16 px-page-gutter pb-80 pt-160 text-center">
                <p aria-hidden="true" className="font-display text-8xl font-bold text-primary">
                    404
                </p>

                <h1 className="font-display text-2xl font-bold md:text-4xl">
                    الصفحة يلي عم تدوّر عليها مش موجودة
                </h1>

                <p className="max-w-420 text-muted">
                    يمكن الرابط غلط أو الصفحة انشالت. بس الأكل لسا موجود!
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-12">
                    <Link
                        href="/menu"
                        className="rounded-full bg-primary px-24 py-10 font-bold text-background transition-opacity hover:opacity-90"
                    >
                        تصفّح القائمة
                    </Link>
                    <Link
                        href="/"
                        className="rounded-full border border-border px-24 py-10 font-bold transition-colors hover:border-primary hover:text-primary"
                    >
                        الرئيسية
                    </Link>
                </div>
            </main>

            <Footer />
        </>
    );
};

export default NotFound;
