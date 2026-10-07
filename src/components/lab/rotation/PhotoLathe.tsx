"use client";

import { useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { bracketFrames, loadImage, mod360, spitFrames, spitImage, wrap180 } from "./spit";
import { useSpin, type SpinOptions } from "./useSpin";

export type TextureMode = "panorama" | "mirror";

interface PhotoLatheProps {
    spin: SpinOptions;
    reverse: boolean;
    textureMode: TextureMode;
    fireLight: boolean;
}

interface SpitProfile {
    /** Horizontal position of the spit's axis, in source pixels. */
    center: number;
    /** Smoothed radius of the meat for every row from meatTop to meatBottom. */
    radii: Float32Array;
}

interface SceneRefs {
    three: typeof THREE;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;
    mesh: THREE.Mesh<THREE.LatheGeometry, THREE.MeshLambertMaterial>;
    fire: THREE.DirectionalLight;
}

const TEXTURE_WIDTH = 2048;
// Source columns on each side of the axis that the texture may sample from.
const STRIP_HALF_WIDTH = 200;
const LATHE_SEGMENTS = 180;
const PROFILE_ROW_STEP = 4;
const PROFILE_SMOOTHING = 6;
const FIRE_INTENSITY = 1.4;

const meatRows = spitImage.meatBottom - spitImage.meatTop;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const smoothstep = (t: number) => t * t * (3 - 2 * t);

function readPixels(img: HTMLImageElement, x: number, y: number, width: number, height: number) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(img, -x, -y);
    return ctx.getImageData(0, 0, width, height);
}

/** Reads the spit's outline from the photo's transparent background. */
function measureProfile(img: HTMLImageElement): SpitProfile {
    const { width, meatTop } = spitImage;
    const { data } = readPixels(img, 0, meatTop, width, meatRows);

    const halfWidths = new Float32Array(meatRows);
    let centerSum = 0;

    for (let y = 0; y < meatRows; y++) {
        let left = -1;
        let right = -1;

        for (let x = 0; x < width; x++) {
            if (data[(y * width + x) * 4 + 3] > 128) {
                if (left < 0) left = x;
                right = x;
            }
        }

        halfWidths[y] = (right - left) / 2;
        centerSum += (left + right) / 2;
    }

    const radii = new Float32Array(meatRows);

    for (let y = 0; y < meatRows; y++) {
        let sum = 0;
        let count = 0;

        for (let k = -PROFILE_SMOOTHING; k <= PROFILE_SMOOTHING; k++) {
            const row = y + k;
            if (row < 0 || row >= meatRows) continue;
            sum += halfWidths[row];
            count++;
        }

        radii[y] = sum / count;
    }

    return { center: centerSum / meatRows, radii };
}

/**
 * Unwraps the meat into a flat texture that goes all the way around the spit.
 * "panorama" takes each column from the photo that faced it most directly and blends neighbours;
 * "mirror" repeats the front of a single photo, flipped back and forth.
 */
function buildTexture(frames: HTMLImageElement[], profile: SpitProfile, mode: TextureMode, reverse: boolean) {
    const direction = reverse ? -1 : 1;
    const stripX = Math.round(profile.center) - STRIP_HALF_WIDTH;
    const stripWidth = STRIP_HALF_WIDTH * 2;
    const axis = profile.center - stripX;

    const sources = mode === "panorama" ? frames : [frames[0]];
    const strips = sources.map((img) => readPixels(img, stripX, spitImage.meatTop, stripWidth, meatRows).data);

    // Each column's sources depend only on its angle, so work them out once per column.
    const fromFrame = new Uint8Array(TEXTURE_WIDTH);
    const toFrame = new Uint8Array(TEXTURE_WIDTH);
    const fromSin = new Float32Array(TEXTURE_WIDTH);
    const toSin = new Float32Array(TEXTURE_WIDTH);
    const blend = new Float32Array(TEXTURE_WIDTH);

    for (let u = 0; u < TEXTURE_WIDTH; u++) {
        const theta = (u / TEXTURE_WIDTH) * 360;

        if (mode === "panorama") {
            const { from, to, t } = bracketFrames(mod360(-direction * theta));
            fromFrame[u] = from;
            toFrame[u] = to;
            fromSin[u] = Math.sin(toRadians(wrap180(theta + direction * spitFrames[from].angle)));
            toSin[u] = Math.sin(toRadians(wrap180(theta + direction * spitFrames[to].angle)));
            blend[u] = smoothstep(t);
        } else {
            const offset = 30 - Math.abs(mod360(theta) % 120 - 60);
            fromSin[u] = toSin[u] = Math.sin(toRadians(offset));
        }
    }

    const output = new ImageData(TEXTURE_WIDTH, meatRows);
    const out = output.data;
    const sample = (strip: Uint8ClampedArray, x: number, y: number, channel: number) =>
        strip[(y * stripWidth + Math.min(stripWidth - 1, Math.max(0, Math.round(x)))) * 4 + channel];

    for (let y = 0; y < meatRows; y++) {
        const radius = profile.radii[y];

        for (let u = 0; u < TEXTURE_WIDTH; u++) {
            const a = strips[fromFrame[u]];
            const b = strips[toFrame[u]];
            const xa = axis + radius * fromSin[u];
            const xb = axis + radius * toSin[u];
            const w = blend[u];
            const i = (y * TEXTURE_WIDTH + u) * 4;

            for (let c = 0; c < 3; c++) {
                out[i + c] = sample(a, xa, y, c) * (1 - w) + sample(b, xb, y, c) * w;
            }
            out[i + 3] = 255;
        }
    }

    const canvas = document.createElement("canvas");
    canvas.width = TEXTURE_WIDTH;
    canvas.height = meatRows;
    canvas.getContext("2d")!.putImageData(output, 0, 0);
    return canvas;
}

/**
 * Approach B: a real 3D spit generated from the photos. The outline comes from the
 * photo's transparency, the meat texture is unwrapped from the frames, and the pole,
 * rings and drips are the original photo with the meat area masked out.
 */
const PhotoLathe = ({ spin, reverse, textureMode, fireLight }: PhotoLatheProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<SceneRefs | null>(null);
    const framesRef = useRef<HTMLImageElement[]>([]);
    const profileRef = useRef<SpitProfile | null>(null);
    const [status, setStatus] = useState<"loading" | "building" | "ready" | "error">("loading");

    /* =========================
       SCENE SETUP
    ========================== */

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let cancelled = false;
        let observer: ResizeObserver | undefined;

        (async () => {
            const [three, frames] = await Promise.all([
                import("three"),
                Promise.all(spitFrames.map((frame) => loadImage(frame.src))),
            ]);
            if (cancelled) return;

            const profile = measureProfile(frames[0]);
            framesRef.current = frames;
            profileRef.current = profile;

            const { width, height, meatTop } = spitImage;

            const renderer = new three.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.outputColorSpace = three.SRGBColorSpace;
            renderer.domElement.className = "absolute inset-0 size-full";
            container.prepend(renderer.domElement);

            // Orthographic camera measured in source pixels, so the 3D spit lines up with the photo.
            const camera = new three.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, -1000, 1000);
            camera.position.z = 500;

            const points: THREE.Vector2[] = [];
            for (let y = meatRows - 1; y >= 0; y -= PROFILE_ROW_STEP) {
                points.push(new three.Vector2(profile.radii[y], height / 2 - (meatTop + y)));
            }
            points.push(new three.Vector2(profile.radii[0], height / 2 - meatTop));

            const mesh = new three.Mesh(
                new three.LatheGeometry(points, LATHE_SEGMENTS),
                new three.MeshLambertMaterial()
            );
            mesh.position.x = profile.center - width / 2;

            const key = new three.DirectionalLight(0xfff1e0, 0.85);
            key.position.set(0.2, 0.3, 1);

            const fire = new three.DirectionalLight(0xff7a1a, FIRE_INTENSITY);
            fire.position.set(-1, -0.1, 0.25);

            const scene = new three.Scene();
            scene.add(mesh, new three.AmbientLight(0xffffff, 0.6), key, fire);

            const resize = () => {
                renderer.setSize(container.clientWidth, container.clientHeight, false);
            };
            resize();
            observer = new ResizeObserver(resize);
            observer.observe(container);

            sceneRef.current = { three, renderer, scene, camera, mesh, fire };
            setStatus("building");
        })().catch(() => {
            if (!cancelled) setStatus("error");
        });

        return () => {
            cancelled = true;
            observer?.disconnect();

            const refs = sceneRef.current;
            if (refs) {
                refs.mesh.geometry.dispose();
                refs.mesh.material.map?.dispose();
                refs.mesh.material.dispose();
                refs.renderer.dispose();
                refs.renderer.domElement.remove();
                sceneRef.current = null;
            }
        };
    }, []);

    /* =========================
       TEXTURE
    ========================== */

    const sceneReady = status !== "loading" && status !== "error";

    useEffect(() => {
        const refs = sceneRef.current;
        const profile = profileRef.current;
        if (!sceneReady || !refs || !profile) return;

        const { three, renderer, mesh } = refs;

        const texture = new three.CanvasTexture(buildTexture(framesRef.current, profile, textureMode, reverse));
        texture.colorSpace = three.SRGBColorSpace;
        texture.wrapS = three.RepeatWrapping;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        const previous = mesh.material.map;
        mesh.material.map = texture;
        mesh.material.needsUpdate = true;
        previous?.dispose();

        // Runs after a texture build, so the callback form is the only state update here.
        setStatus((current) => (current === "building" ? "ready" : current));
    }, [sceneReady, textureMode, reverse]);

    /* =========================
       RENDER LOOP
    ========================== */

    const handlers = useSpin(spin, (angle) => {
        const refs = sceneRef.current;
        if (!refs || !refs.mesh.material.map) return;

        refs.mesh.rotation.y = toRadians(angle);
        refs.fire.intensity = fireLight ? FIRE_INTENSITY : 0;
        refs.renderer.render(refs.scene, refs.camera);
    });

    const top = (spitImage.meatTop / spitImage.height) * 100;
    const bottom = (spitImage.meatBottom / spitImage.height) * 100;
    const meatMask = `linear-gradient(to bottom, #000 ${top}%, transparent ${top}%, transparent ${bottom}%, #000 ${bottom}%)`;

    return (
        <div
            ref={containerRef}
            {...handlers}
            className="relative size-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
        >
            {/* Pole, rings and drips from the photo; the meat area is masked out and drawn in 3D. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={spitFrames[0].src}
                alt=""
                draggable={false}
                className="pointer-events-none absolute inset-0 size-full"
                style={{ maskImage: meatMask, WebkitMaskImage: meatMask }}
            />

            {status !== "ready" && (
                <p className="absolute inset-x-0 bottom-16 text-center text-sm text-muted">
                    {status === "error" ? "Couldn't start WebGL" : "Building 3D spit…"}
                </p>
            )}
        </div>
    );
};

export default PhotoLathe;
