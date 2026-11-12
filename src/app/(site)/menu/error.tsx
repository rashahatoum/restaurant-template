"use client";

// The menu couldn't be loaded and there's no earlier copy to show (a
// background refresh that fails keeps the last good page instead). Client
// component, as every error boundary: it can't read the phone numbers, but the
// footer with «تواصل معنا» stays visible (it's in the (site) layout), so the
// page points there.
const MenuError = ({ retry }: { error: Error & { digest?: string }; retry: () => void }) => (
    <main className="flex min-h-[70dvh] flex-col items-center justify-center gap-16 px-page-gutter pb-80 pt-160 text-center">
        <h1 className="font-display text-2xl font-bold md:text-4xl">القائمة مش متاحة هلق، اطلب على الواتساب</h1>

        <p className="max-w-420 text-muted">رقمنا تحت بـ«تواصل معنا». أو جرّب كمان شوي.</p>

        <div className="mt-8 flex flex-wrap justify-center gap-12">
            <a
                href="#contact"
                className="rounded-full bg-primary px-24 py-10 font-bold text-background transition-opacity hover:opacity-90"
            >
                تواصل معنا
            </a>
            <button
                type="button"
                onClick={() => retry()}
                className="rounded-full border border-border px-24 py-10 font-bold transition-colors hover:border-primary hover:text-primary"
            >
                جرّب مرة تانية
            </button>
        </div>
    </main>
);

export default MenuError;
