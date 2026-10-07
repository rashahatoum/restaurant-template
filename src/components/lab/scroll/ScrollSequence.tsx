"use client";

import { useEffect, useRef } from "react";

export interface ScrollScene {
    /** Where the scene starts and ends, as a fraction (0..1) of the sequence's scroll distance. */
    from: number;
    to: number;
    eyebrow?: string;
    title: string;
    body?: string;
}

interface ScrollSequenceProps {
    frames: string[];
    scenes: ScrollScene[];
    /** Scroll distance of the whole sequence, in viewport heights. */
    length?: number;
    /** "cover" for full-bleed video frames, "contain" for cut-outs over a background. */
    fit?: "cover" | "contain";
    /** Horizontal placement of "contain" frames on wide screens. */
    align?: "left" | "center" | "right";
    background?: string;
}

// How quickly the picture catches up with the scrollbar (per second). Lower is floatier.
const SCRUB_EASE = 7;
const SCENE_FADE = 0.04;
// Load every 8th frame first so scrubbing works early, then fill in the gaps.
const LOAD_STRIDES = [8, 4, 2, 1];

/**
 * Pins a canvas to the viewport and plays an image sequence as the visitor scrolls,
 * blending neighbouring frames and easing toward the scroll position so it feels like video.
 */
const ScrollSequence = ({ frames, scenes, length = 4, fit = "cover", align = "center", background }: ScrollSequenceProps) => {
    const sectionRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const section = sectionRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!section || !canvas || !ctx) return;

        /* =========================
           PROGRESSIVE LOADING
        ========================== */

        const images: (HTMLImageElement | null)[] = frames.map(() => null);
        let cancelled = false;

        (async () => {
            const queued = new Set<number>();

            for (const stride of LOAD_STRIDES) {
                const batch: Promise<void>[] = [];

                for (let i = 0; i < frames.length; i += stride) {
                    if (queued.has(i)) continue;
                    queued.add(i);

                    const img = new Image();
                    img.src = frames[i];
                    batch.push(
                        img.decode().then(
                            () => {
                                if (!cancelled) images[i] = img;
                            },
                            () => {}
                        )
                    );
                }

                await Promise.all(batch);
                if (cancelled) return;
            }
        })();

        const nearestLoaded = (index: number) => {
            for (let offset = 0; offset < frames.length; offset++) {
                if (images[index - offset]) return index - offset;
                if (images[index + offset]) return index + offset;
            }
            return -1;
        };

        /* =========================
           DRAWING
        ========================== */

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio, 2);
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
            lastDrawn = "";
        };

        const drawFrame = (img: HTMLImageElement, alpha: number) => {
            const { width, height } = canvas;
            const scale =
                fit === "cover"
                    ? Math.max(width / img.naturalWidth, height / img.naturalHeight)
                    : Math.min(width / img.naturalWidth, height / img.naturalHeight);
            const w = img.naturalWidth * scale;
            const h = img.naturalHeight * scale;

            const landscape = width > height;
            const gap = width - w;
            const x = !landscape || align === "center" ? gap / 2 : align === "left" ? gap * 0.15 : gap * 0.85;

            ctx.globalAlpha = alpha;
            ctx.drawImage(img, x, (height - h) / 2, w, h);
        };

        let lastDrawn = "";

        const draw = (position: number) => {
            const lower = Math.floor(position);
            const upper = Math.min(lower + 1, frames.length - 1);
            const t = position - lower;
            const from = images[lower] && images[upper] ? lower : nearestLoaded(Math.round(position));
            if (from < 0) return;

            const blend = from === lower && upper !== lower;
            const key = blend ? `${lower}:${t.toFixed(3)}` : `${from}`;
            if (key === lastDrawn) return;
            lastDrawn = key;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawFrame(images[from]!, 1);
            if (blend && t > 0.001) drawFrame(images[upper]!, t);
            ctx.globalAlpha = 1;
        };

        /* =========================
           SCROLL LOOP
        ========================== */

        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const observer = new ResizeObserver(resize);
        observer.observe(canvas);
        resize();

        let progress = -1;
        let last = performance.now();
        let frame = 0;

        const tick = (now: number) => {
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;

            const rect = section.getBoundingClientRect();
            const distance = rect.height - window.innerHeight;
            const target = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0;

            progress =
                progress < 0 || reduceMotion.matches
                    ? target
                    : progress + (target - progress) * (1 - Math.exp(-SCRUB_EASE * dt));

            draw(progress * (frames.length - 1));

            scenes.forEach((scene, index) => {
                const el = sceneRefs.current[index];
                if (!el) return;

                // The first scene is already showing at the top, and the last one stays at the end.
                const fadeIn = scene.from <= 0 ? 1 : (progress - scene.from) / SCENE_FADE;
                const fadeOut = scene.to >= 1 ? 1 : (scene.to - progress) / SCENE_FADE;
                const opacity = Math.max(0, Math.min(1, fadeIn, fadeOut));

                el.style.opacity = String(opacity);
                el.style.transform = `translateY(${(1 - opacity) * 24}px)`;
                el.style.visibility = opacity > 0 ? "visible" : "hidden";
            });

            frame = requestAnimationFrame(tick);
        };

        frame = requestAnimationFrame(tick);

        return () => {
            cancelled = true;
            cancelAnimationFrame(frame);
            observer.disconnect();
        };
    }, [frames, scenes, fit, align]);

    return (
        <div ref={sectionRef} className="relative" style={{ height: `${length * 100}dvh` }}>
            <div
                className="sticky top-0 h-dvh overflow-hidden bg-cover bg-center"
                style={background ? { backgroundImage: `url(${background})` } : undefined}
            >
                <canvas ref={canvasRef} className="absolute inset-0 size-full" />

                {scenes.map((scene, index) => (
                    <div
                        key={scene.title}
                        ref={(el) => {
                            sceneRefs.current[index] = el;
                        }}
                        className="invisible absolute inset-y-0 inset-s-0 flex w-full flex-col justify-end gap-12 bg-linear-to-t from-black/80 to-transparent p-24 pb-64 opacity-0 md:w-1/2 md:justify-center md:bg-none md:ps-[8vw]"
                    >
                        {scene.eyebrow && (
                            <p className="font-body text-sm font-bold tracking-wide text-primary md:text-base">
                                {scene.eyebrow}
                            </p>
                        )}
                        <h2 className="font-display text-4xl font-bold leading-tight md:text-6xl">{scene.title}</h2>
                        {scene.body && <p className="max-w-md font-body text-base text-muted md:text-lg">{scene.body}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScrollSequence;
