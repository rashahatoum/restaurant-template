"use client";

import { Children, useState, type ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface SliderProps {
    /** Accessible name of the slider, usually the section title. */
    label: string;
    /** One child per slide. Children (not a render prop) so a Server Component can pass server-rendered cards. */
    children: ReactNode;
    /** Optional link in the arrows row, on the end side (e.g. "عرض الكل"). */
    action?: ReactNode;
}

/** Distance of slide `index` from the active slide, in (-count/2, count/2]. */
function getOffset(index: number, active: number, count: number) {
    const offset = (index - active + count) % count;

    return offset > count / 2 ? offset - count : offset;
}

// Slides share one grid cell and move by offset: 0 = center, +1 = next
// (left in RTL), -1 = previous. Mobile shows the center slide only.
// From md a slide is 28% of the slider width; side slides (scale 0.8) move
// 139% of that, so their outer edge lands on the slider edge (= page gutter).
function getPositionClasses(offset: number) {
    if (offset === 0) return "z-10 opacity-100";

    const side =
        offset > 0
            ? "-translate-x-full md:-translate-x-[139%] ltr:translate-x-full ltr:md:translate-x-[139%]"
            : "translate-x-full md:translate-x-[139%] ltr:-translate-x-full ltr:md:-translate-x-[139%]";

    if (Math.abs(offset) === 1) {
        return `${side} scale-80 invisible opacity-0 md:visible md:opacity-60`;
    }

    const far =
        offset > 0
            ? "-translate-x-[280%] ltr:translate-x-[280%]"
            : "translate-x-[280%] ltr:-translate-x-[280%]";

    return `${far} scale-80 invisible opacity-0`;
}

const Slider = ({ label, children, action }: SliderProps) => {
    const slides = Children.toArray(children);
    const count = slides.length;

    // `previous` tells which slides wrapped around on the last move.
    const [{ active, previous }, setPosition] = useState({
        active: 0,
        previous: 0,
    });

    const move = (step: 1 | -1) =>
        setPosition((current) => ({
            previous: current.active,
            active: (current.active + step + count) % count,
        }));

    // One slide: no arrows, same width as a center slide.
    if (count <= 1) {
        return (
            <div className="mx-auto w-[75%] max-w-360 md:w-[28%] md:max-w-none">
                {slides}
                {action && <div className="mt-24 flex justify-center">{action}</div>}
            </div>
        );
    }

    return (
        <div
            role="region"
            aria-roledescription="carousel"
            aria-label={label}
            className="w-full"
        >
            <div className="grid overflow-x-clip py-20">
                {slides.map((slide, index) => {
                    const offset = getOffset(index, active, count);
                    const wrapped =
                        Math.abs(offset - getOffset(index, previous, count)) >
                        1;

                    return (
                        <div
                            key={index}
                            className={`
                                col-start-1
                                row-start-1
                                mx-auto
                                w-[75%]
                                max-w-360
                                duration-500
                                ease-out

                                md:w-[28%]
                                md:max-w-none

                                motion-reduce:animate-none
                                motion-reduce:transition-none

                                ${wrapped ? "animate-slider-fade" : "transition"}
                                ${getPositionClasses(offset)}
                            `}
                        >
                            {slide}
                        </div>
                    );
                })}
            </div>

            {/* Arrows centered, the optional action on the end side (left in RTL).
                Three columns so the action never pushes the arrows off center. */}
            <div className="mt-24 grid grid-cols-[1fr_auto_1fr] items-center">
                {/* In RTL the first button sits on the right (previous). */}
                <div className="col-start-2 flex gap-16">
                    <button
                        type="button"
                        onClick={() => move(-1)}
                        aria-label="السابق"
                        className="flex size-48 items-center justify-center rounded-full border-2 border-primary text-2xl text-primary transition-colors hover:bg-primary hover:text-background"
                    >
                        <FiChevronRight className="ltr:rotate-180" />
                    </button>

                    <button
                        type="button"
                        onClick={() => move(1)}
                        aria-label="التالي"
                        className="flex size-48 items-center justify-center rounded-full border-2 border-primary text-2xl text-primary transition-colors hover:bg-primary hover:text-background"
                    >
                        <FiChevronLeft className="ltr:rotate-180" />
                    </button>
                </div>

                {action && <div className="justify-self-end">{action}</div>}
            </div>

            <p aria-live="polite" className="sr-only">
                {`${active + 1} من ${count}`}
            </p>
        </div>
    );
};

export default Slider;
