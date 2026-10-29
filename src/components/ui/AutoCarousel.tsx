"use client";

import {
    Children,
    useEffect,
    useState,
    useSyncExternalStore,
    type FocusEvent,
    type PointerEvent,
    type ReactNode,
} from "react";
import { FiPause, FiPlay } from "react-icons/fi";

interface AutoCarouselProps {
    /** Accessible name of the carousel. */
    label: string;
    /** Time each slide stays, in ms. */
    interval?: number;
    /** One child per slide. Children so a Server Component can pass server-rendered slides. */
    children: ReactNode;
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
    const query = window.matchMedia(REDUCED_MOTION);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
}

// Full-width slides that cross-fade on a timer (unlike ui/Slider, which shows
// three cards). Auto-play pauses on hover/focus, can be stopped with a button
// (WCAG 2.2.2), and never starts under reduced motion.
const AutoCarousel = ({ label, interval = 5000, children }: AutoCarouselProps) => {
    const slides = Children.toArray(children);
    const count = slides.length;

    const [active, setActive] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isStopped, setIsStopped] = useState(false);

    // false on the server, the real value after hydration (no mismatch).
    const prefersReducedMotion = useSyncExternalStore(
        subscribeToReducedMotion,
        () => window.matchMedia(REDUCED_MOTION).matches,
        () => false
    );

    const canAutoPlay = count > 1 && !prefersReducedMotion;
    const isPlaying = canAutoPlay && !isStopped;

    // A timer is a real side effect. Keyed on `active`, so picking a slide
    // by hand restarts the countdown.
    useEffect(() => {
        if (!isPlaying || isHovered) return;

        const timer = window.setTimeout(
            () => setActive((active + 1) % count),
            interval
        );
        return () => window.clearTimeout(timer);
    }, [active, count, interval, isPlaying, isHovered]);

    // Hover pause is for a mouse only: on touch screens a tap fires "enter"
    // with no "leave", which would pause the carousel for good.
    const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
        if (event.pointerType === "mouse") setIsHovered(true);
    };

    // Focus moving between elements inside the carousel is not a "leave".
    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsHovered(false);
        }
    };

    return (
        <div
            role="region"
            aria-roledescription="carousel"
            aria-label={label}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={() => setIsHovered(false)}
            // Keyboard focus pauses; a tap on the dots (focus from a pointer) doesn't.
            onFocus={(event) => {
                if (event.target.matches(":focus-visible")) setIsHovered(true);
            }}
            onBlur={handleBlur}
        >
            {/* All slides share one grid cell, so the tallest sets the height. */}
            <div className="grid">
                {slides.map((slide, index) => {
                    const isActive = index === active;

                    return (
                        <div
                            key={index}
                            role="group"
                            aria-roledescription="slide"
                            aria-label={`${index + 1} من ${count}`}
                            // Hidden slides leave the tab order and the accessibility tree.
                            inert={!isActive}
                            className={`
                                col-start-1
                                row-start-1
                                transition-[opacity,visibility]
                                duration-700
                                ease-out
                                motion-reduce:transition-none
                                ${isActive ? "visible opacity-100" : "invisible opacity-0"}
                            `}
                        >
                            {slide}
                        </div>
                    );
                })}
            </div>

            {count > 1 && (
                <div className="mt-4 flex items-center justify-center">
                    {slides.map((_, index) => {
                        const isActive = index === active;

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setActive(index)}
                                aria-label={`الشريحة ${index + 1} من ${count}`}
                                aria-current={isActive}
                                className="flex size-28 items-center justify-center"
                            >
                                <span
                                    className={`block h-6 rounded-full transition-[width,background-color] duration-300 motion-reduce:transition-none ${
                                        isActive ? "w-22 bg-primary" : "w-6 bg-muted/40"
                                    }`}
                                />
                            </button>
                        );
                    })}

                    {canAutoPlay && (
                        <button
                            type="button"
                            onClick={() => setIsStopped(!isStopped)}
                            aria-label={
                                isPlaying
                                    ? "إيقاف التبديل التلقائي"
                                    : "تشغيل التبديل التلقائي"
                            }
                            className="ms-4 flex size-28 items-center justify-center text-sm text-muted transition-colors hover:text-primary"
                        >
                            {isPlaying ? <FiPause /> : <FiPlay />}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default AutoCarousel;
