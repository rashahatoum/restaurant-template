"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";

export interface SpinOptions {
    /** Idle speed in degrees per second. */
    speed: number;
    /** Speed multiplier while the pointer is over the stage. */
    hoverBoost: number;
}

const DRAG_DEGREES_PER_PX = 0.6;
const MAX_THROW_SPEED = 720;
// How quickly the speed settles back to its target after hover or a throw (per second).
const EASE_RATE = 2.5;

/**
 * Drives a continuous rotation angle with eased speed changes, hover boost
 * and drag-to-spin with inertia. Calls `onFrame` with the angle (0..360) on every animation frame.
 * Positive angles mean the front surface moves to the right.
 */
export function useSpin(options: SpinOptions, onFrame: (angle: number) => void) {
    const optionsRef = useRef(options);
    const onFrameRef = useRef(onFrame);

    useEffect(() => {
        optionsRef.current = options;
        onFrameRef.current = onFrame;
    });

    const state = useRef({
        angle: 0,
        velocity: 0,
        hovering: false,
        dragging: false,
        lastX: 0,
        lastTime: 0,
    });

    useEffect(() => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let frame = 0;
        let last = performance.now();

        const tick = (now: number) => {
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;

            const s = state.current;
            const { speed, hoverBoost } = optionsRef.current;

            if (!s.dragging) {
                const target = reduceMotion.matches ? 0 : speed * (s.hovering ? hoverBoost : 1);
                s.velocity += (target - s.velocity) * (1 - Math.exp(-EASE_RATE * dt));
                s.angle += s.velocity * dt;
            }

            s.angle = ((s.angle % 360) + 360) % 360;
            onFrameRef.current(s.angle);
            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, []);

    const endDrag = () => {
        state.current.dragging = false;
    };

    return {
        onPointerEnter: () => {
            state.current.hovering = true;
        },
        onPointerLeave: () => {
            state.current.hovering = false;
        },
        onPointerDown: (event: PointerEvent<HTMLElement>) => {
            const s = state.current;
            s.dragging = true;
            s.velocity = 0;
            s.lastX = event.clientX;
            s.lastTime = event.timeStamp;
            event.currentTarget.setPointerCapture(event.pointerId);
        },
        onPointerMove: (event: PointerEvent<HTMLElement>) => {
            const s = state.current;
            if (!s.dragging) return;

            const delta = (event.clientX - s.lastX) * DRAG_DEGREES_PER_PX;
            const dt = Math.max((event.timeStamp - s.lastTime) / 1000, 1 / 240);
            const throwSpeed = Math.max(-MAX_THROW_SPEED, Math.min(MAX_THROW_SPEED, delta / dt));

            s.angle += delta;
            s.velocity = s.velocity * 0.5 + throwSpeed * 0.5;
            s.lastX = event.clientX;
            s.lastTime = event.timeStamp;
        },
        onPointerUp: endDrag,
        onPointerCancel: endDrag,
    };
}
