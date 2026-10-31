"use client";

import { useEffect, useRef } from "react";

export interface SpinMotion {
    /** Cruising speed, in degrees per second. Positive: the front moves to the right. */
    speed: number;
    /** Seconds to reach cruising speed. */
    easeIn: number;
    /** Seconds at cruising speed. */
    hold: number;
    /** Seconds to slow down to a stop. */
    easeOut: number;
}

const smoothstep = (t: number) => {
    const x = Math.min(1, Math.max(0, t));
    return x * x * (3 - 2 * x);
};

/**
 * One "spin session" at a time: speeds up, turns for a while, slows to a stop.
 * `spin()` starts a new session (load, hover, tap); starting one while turning
 * picks up from the current speed, so it never jerks. Progress follows the
 * clock (a slow device doesn't stretch it), and nothing renders between
 * sessions. `onFrame` gets the angle in degrees.
 */
export function useSpinSession(motion: SpinMotion, onFrame: (angle: number) => void) {
    const motionRef = useRef(motion);
    const onFrameRef = useRef(onFrame);

    useEffect(() => {
        motionRef.current = motion;
        onFrameRef.current = onFrame;
    });

    const state = useRef({
        angle: 0,
        velocity: 0,
        startVelocity: 0,
        /** performance.now() when the current session started; null when idle. */
        startedAt: null as number | null,
        frame: 0,
        last: 0,
    });

    const tick = (now: number) => {
        const s = state.current;
        if (s.startedAt === null) return;

        // The step is capped only for the angle (a hidden tab pauses frames).
        const dt = Math.min((now - s.last) / 1000, 0.1);
        s.last = now;
        const t = (now - s.startedAt) / 1000;
        const { speed, easeIn, hold, easeOut } = motionRef.current;

        if (t < easeIn) {
            s.velocity = s.startVelocity + (speed - s.startVelocity) * smoothstep(t / easeIn);
        } else if (t < easeIn + hold) {
            s.velocity = speed;
        } else {
            s.velocity = speed * (1 - smoothstep((t - easeIn - hold) / easeOut));
        }

        s.angle = (s.angle + s.velocity * dt) % 360;
        onFrameRef.current(s.angle);

        if (t >= easeIn + hold + easeOut) {
            s.startedAt = null;
            s.velocity = 0;
            return;
        }
        s.frame = requestAnimationFrame(tick);
    };

    const spin = () => {
        const s = state.current;
        const idle = s.startedAt === null;
        const now = performance.now();

        s.startVelocity = s.velocity;
        s.startedAt = now;

        if (idle) {
            s.last = now;
            s.frame = requestAnimationFrame(tick);
        }
    };

    useEffect(() => () => cancelAnimationFrame(state.current.frame), []);

    /** Draws the current angle once (after building or resizing). */
    const redraw = () => onFrameRef.current(state.current.angle);

    return { spin, redraw };
}
