"use client";

import { useEffect, useRef, useState } from "react";
import { bracketFrames, loadImage, spitFrames, spitImage } from "./spit";
import { useSpin, type SpinOptions } from "./useSpin";

interface FrameCrossfadeProps {
    spin: SpinOptions;
    reverse: boolean;
    crossfade: boolean;
}

/**
 * Approach A: the existing photo frames, preloaded and drawn on a canvas,
 * blending each frame into the next instead of snapping between them.
 */
const FrameCrossfade = ({ spin, reverse, crossfade }: FrameCrossfadeProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const framesRef = useRef<HTMLImageElement[] | null>(null);
    const [loaded, setLoaded] = useState(0);

    useEffect(() => {
        let cancelled = false;
        let count = 0;

        Promise.all(
            spitFrames.map((frame) =>
                loadImage(frame.src).then((img) => {
                    if (!cancelled) setLoaded(++count);
                    return img;
                })
            )
        ).then((images) => {
            if (!cancelled) framesRef.current = images;
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const handlers = useSpin(spin, (angle) => {
        const frames = framesRef.current;
        const ctx = canvasRef.current?.getContext("2d");
        if (!frames || !ctx) return;

        const { from, to, t } = bracketFrames(reverse ? -angle : angle);

        ctx.clearRect(0, 0, spitImage.width, spitImage.height);

        if (!crossfade) {
            ctx.drawImage(frames[t < 0.5 ? from : to], 0, 0);
            return;
        }

        ctx.globalAlpha = 1;
        ctx.drawImage(frames[from], 0, 0);
        ctx.globalAlpha = t;
        ctx.drawImage(frames[to], 0, 0);
        ctx.globalAlpha = 1;
    });

    return (
        <div {...handlers} className="relative size-full cursor-grab touch-pan-y select-none active:cursor-grabbing">
            <canvas
                ref={canvasRef}
                width={spitImage.width}
                height={spitImage.height}
                className="absolute inset-0 size-full"
            />

            {loaded < spitFrames.length && (
                <p className="absolute inset-x-0 bottom-16 text-center text-sm text-muted">
                    Loading frames {loaded}/{spitFrames.length}
                </p>
            )}
        </div>
    );
};

export default FrameCrossfade;
