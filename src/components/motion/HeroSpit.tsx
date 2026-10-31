"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { SpitScene } from "./spitScene";
import { useSpinSession, type SpinMotion } from "./useSpinSession";

interface HeroSpitProps {
    image: { src: string; alt: string; width: number; height: number };
    motion: SpinMotion;
}

/** Devices this low on memory keep the photo. */
const LOW_MEMORY_GB = 2;

// The hero spit. The photo renders first (it's the LCP image); once the page
// is idle, three.js and the scene load and a 3D copy fades in over it and
// spins once. Hover (mouse) or tap spins it again. It stays a still photo
// under reduced motion, on low-memory devices, or if WebGL fails.
const HeroSpit = ({ image, motion }: HeroSpitProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const sceneRef = useRef<SpitScene | null>(null);
    const [is3d, setIs3d] = useState(false);

    const { spin, redraw } = useSpinSession(motion, (angle) => sceneRef.current?.render(angle));

    useEffect(() => {
        const container = containerRef.current;
        const photo = imgRef.current;
        if (!container || !photo) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
        if (memory !== undefined && memory <= LOW_MEMORY_GB) return;

        let cancelled = false;
        let resizeObserver: ResizeObserver | undefined;

        const start = async () => {
            const [three, { createSpitScene }] = await Promise.all([import("three"), import("./spitScene")]);
            await photo.decode();
            // The photo the browser already downloaded (optimized by next/image): no second download.
            const source = new window.Image();
            source.src = photo.currentSrc || photo.src;
            await source.decode();
            if (cancelled) return;

            const scene = createSpitScene(three, source, source.src);
            scene.canvas.className = "absolute inset-0 size-full opacity-0 transition-opacity duration-500";
            container.append(scene.canvas);
            sceneRef.current = scene;

            const resize = () => {
                scene.resize(container.clientWidth, container.clientHeight);
                redraw();
            };
            resizeObserver = new ResizeObserver(resize);
            resizeObserver.observe(container);
            resize();

            // Cross-fade: 3D in, photo out, then the first spin.
            requestAnimationFrame(() => {
                scene.canvas.classList.remove("opacity-0");
                setIs3d(true);
                spin();
            });
        };

        // After the page has settled, so three.js never competes with the first paint.
        const requestIdle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 300));
        const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
        const idleHandle = requestIdle(() => {
            start().catch(() => {
                // No WebGL or a failed load: the photo simply stays.
            });
        });

        return () => {
            cancelled = true;
            cancelIdle(idleHandle);
            resizeObserver?.disconnect();
            sceneRef.current?.dispose();
            sceneRef.current = null;
        };
        // Set up once; spin/redraw read the latest motion through refs.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div
            ref={containerRef}
            onPointerEnter={(event) => {
                if (is3d && event.pointerType === "mouse") spin();
            }}
            onClick={() => {
                if (is3d) spin();
            }}
            className={`relative aspect-2/3 h-full shrink-0 select-none ${is3d ? "cursor-pointer" : ""}`}
        >
            <Image
                ref={imgRef}
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                preload
                draggable={false}
                // Shown 100vh tall, at a 2:3 ratio
                sizes="67vh"
                className={`absolute inset-0 size-full object-contain transition-opacity duration-500 ${
                    is3d ? "opacity-0" : ""
                }`}
            />
        </div>
    );
};

export default HeroSpit;
