"use client";

import { restaurantConfig } from "@/config/restaurant";
import type { SpitScene } from "@/components/motion/spitScene";
import { useSpinSession, type SpinMotion } from "@/components/motion/useSpinSession";
import { useEffect, useRef, useState } from "react";

interface PhotoLatheProps {
    spin: SpinMotion;
    fireLight: boolean;
    /** Changes every time the lab's "spin" button is pressed. */
    spinSignal: number;
}

const { src } = restaurantConfig.hero.spit.image;

// Lab stage for the production spit scene (components/motion/spitScene), with
// live-tunable motion. Production uses components/motion/HeroSpit.
const PhotoLathe = ({ spin, fireLight, spinSignal }: PhotoLatheProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<SpitScene | null>(null);
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

    const { spin: startSpin, redraw } = useSpinSession(spin, (angle) => sceneRef.current?.render(angle));

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let cancelled = false;
        let observer: ResizeObserver | undefined;

        (async () => {
            const [three, { createSpitScene }] = await Promise.all([
                import("three"),
                import("@/components/motion/spitScene"),
            ]);
            const img = new window.Image();
            img.src = src;
            await img.decode();
            if (cancelled) return;

            const scene = createSpitScene(three, img, src);
            scene.canvas.className = "absolute inset-0 size-full";
            container.prepend(scene.canvas);
            sceneRef.current = scene;

            const resize = () => {
                scene.resize(container.clientWidth, container.clientHeight);
                redraw();
            };
            observer = new ResizeObserver(resize);
            observer.observe(container);
            resize();
            setStatus("ready");
            startSpin();
        })().catch(() => {
            if (!cancelled) setStatus("error");
        });

        return () => {
            cancelled = true;
            observer?.disconnect();
            sceneRef.current?.dispose();
            sceneRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        sceneRef.current?.setFireLight(fireLight);
        redraw();
    }, [fireLight, status, redraw]);

    useEffect(() => {
        if (spinSignal > 0) startSpin();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spinSignal]);

    return (
        <div
            ref={containerRef}
            onPointerEnter={(event) => {
                if (event.pointerType === "mouse") startSpin();
            }}
            onClick={startSpin}
            className="relative size-full cursor-pointer select-none"
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt=""
                draggable={false}
                className={`pointer-events-none absolute inset-0 size-full object-contain ${status === "ready" ? "opacity-0" : ""}`}
            />
            {status === "error" && (
                <p className="absolute inset-x-0 bottom-16 text-center text-sm text-muted">Couldn&apos;t start WebGL</p>
            )}
        </div>
    );
};

export default PhotoLathe;
