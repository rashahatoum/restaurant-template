// A grey placeholder shape while content loads. Hook-free, no JS: a CSS pulse
// that stops with reduced motion. Hidden from screen readers (the loading
// wrapper says "loading" once, with aria-busy / a status line).
const Skeleton = ({ className = "" }: { className?: string }) => (
    // A tint of the text colour: visible on any theme's background (surface was too close to it)
    <div aria-hidden="true" className={`rounded-xl bg-foreground/10 motion-safe:animate-pulse ${className}`} />
);

export default Skeleton;
