"use client";

import { useEffect, useRef, useState } from "react";
import type { SpinOptions } from "./useSpin";

const VIDEO_SOURCES = [
    { src: "/assets/lab/spit-loop.webm", type: "video/webm" },
    { src: "/assets/lab/spit-loop.mp4", type: "video/mp4" },
];

// The idle speed that plays the video at its normal rate.
const NORMAL_SPEED = 30;

/**
 * Approach C: a looping video of the spit turning. Speed follows the shared controls,
 * easing up on hover like the other approaches.
 */
const VideoLoop = ({ spin }: { spin: SpinOptions }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hoveringRef = useRef(false);
    const [missing, setMissing] = useState(false);

    // The sources can fail before React attaches handlers, so check the element's state after mounting too.
    useEffect(() => {
        const video = videoRef.current;
        const lastSource = video?.querySelector("source:last-of-type");
        if (!video || !lastSource) return;

        const check = () => {
            if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) setMissing(true);
        };

        lastSource.addEventListener("error", check);
        const timeout = setTimeout(check, 0);

        return () => {
            lastSource.removeEventListener("error", check);
            clearTimeout(timeout);
        };
    }, []);

    useEffect(() => {
        let frame = 0;

        const tick = () => {
            const video = videoRef.current;

            if (video) {
                const target = (spin.speed / NORMAL_SPEED) * (hoveringRef.current ? spin.hoverBoost : 1);
                const rate = video.playbackRate + (target - video.playbackRate) * 0.05;
                video.playbackRate = Math.min(4, Math.max(0.1, rate));
            }

            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [spin.speed, spin.hoverBoost]);

    if (missing) {
        return (
            <div className="flex size-full flex-col items-center justify-center gap-8 p-24 text-center text-sm text-muted">
                <p className="text-base font-bold text-foreground">No video yet</p>
                <p>
                    Add a seamless 360° loop at <code className="text-primary">public/assets/lab/spit-loop.webm</code>{" "}
                    (transparent) or <code className="text-primary">spit-loop.mp4</code> (dark background).
                </p>
            </div>
        );
    }

    return (
        <div
            className="relative size-full"
            onPointerEnter={() => (hoveringRef.current = true)}
            onPointerLeave={() => (hoveringRef.current = false)}
        >
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 size-full object-contain"
            >
                {VIDEO_SOURCES.map((source) => (
                    <source key={source.src} src={source.src} type={source.type} />
                ))}
            </video>
        </div>
    );
};

export default VideoLoop;
