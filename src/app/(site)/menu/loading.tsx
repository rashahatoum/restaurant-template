// Shown while a menu page renders on demand (normally they're served
// prerendered, so this is rare). Plain shapes, no JS; motion only when allowed.
const MenuLoading = () => (
    <main aria-busy="true" className="pb-120 pt-80 md:pb-140">
        <p className="sr-only" role="status">
            عم نحمّل القائمة…
        </p>
        <div aria-hidden="true" className="mx-auto flex max-w-960 flex-col gap-16 px-page-gutter pt-24">
            <div className="h-160 rounded-3xl bg-surface motion-safe:animate-pulse" />
            {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="h-88 rounded-2xl bg-surface motion-safe:animate-pulse" />
            ))}
        </div>
    </main>
);

export default MenuLoading;
