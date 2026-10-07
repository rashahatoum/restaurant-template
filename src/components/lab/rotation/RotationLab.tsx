"use client";

import { useState } from "react";
import { restaurantConfig } from "@/config/restaurant";
import FrameCrossfade from "./FrameCrossfade";
import PhotoLathe, { type TextureMode } from "./PhotoLathe";
import VideoLoop from "./VideoLoop";

const RotationLab = () => {
    const [speed, setSpeed] = useState(30);
    const [hoverBoost, setHoverBoost] = useState(2.5);
    const [reverse, setReverse] = useState(false);
    const [crossfade, setCrossfade] = useState(true);
    const [textureMode, setTextureMode] = useState<TextureMode>("panorama");
    const [fireLight, setFireLight] = useState(true);

    const spin = { speed, hoverBoost };

    const approaches = [
        {
            title: "A · Photo frames",
            note: "The 18 existing frames, preloaded and blended into each other.",
            stage: <FrameCrossfade spin={spin} reverse={reverse} crossfade={crossfade} />,
        },
        {
            title: "B · 3D from photos",
            note: "Shape and texture taken from the photos, rotated in real 3D.",
            stage: <PhotoLathe spin={spin} reverse={reverse} textureMode={textureMode} fireLight={fireLight} />,
        },
        {
            title: "C · Video loop",
            note: "A pre-rendered 360° loop. Smoothest if you can source a good video.",
            stage: <VideoLoop spin={spin} />,
        },
    ];

    return (
        <div dir="ltr" className="min-h-dvh bg-background p-16 font-body text-foreground md:p-32">
            <header className="mb-24 flex flex-col gap-6">
                <h1 className="font-display text-3xl font-bold">Spit rotation lab</h1>
                <p className="text-muted">
                    Hover to speed up, drag sideways to spin. Only available in development.
                </p>
            </header>

            <div className="mb-24 flex flex-wrap items-center gap-x-32 gap-y-16 rounded-2xl border border-border bg-surface p-16 text-sm">
                <label className="flex items-center gap-10">
                    Speed {speed}°/s
                    <input type="range" min={0} max={120} value={speed} onChange={(e) => setSpeed(+e.target.value)} />
                </label>

                <label className="flex items-center gap-10">
                    Hover boost ×{hoverBoost}
                    <input
                        type="range"
                        min={1}
                        max={4}
                        step={0.5}
                        value={hoverBoost}
                        onChange={(e) => setHoverBoost(+e.target.value)}
                    />
                </label>

                <label className="flex items-center gap-8">
                    <input type="checkbox" checked={reverse} onChange={(e) => setReverse(e.target.checked)} />
                    Reverse frame order
                </label>

                <label className="flex items-center gap-8">
                    <input type="checkbox" checked={crossfade} onChange={(e) => setCrossfade(e.target.checked)} />
                    Crossfade (A)
                </label>

                <label className="flex items-center gap-8">
                    Texture (B)
                    <select
                        value={textureMode}
                        onChange={(e) => setTextureMode(e.target.value as TextureMode)}
                        className="rounded-md border border-border bg-background px-8 py-4"
                    >
                        <option value="panorama">Panorama from all frames</option>
                        <option value="mirror">Mirror one photo</option>
                    </select>
                </label>

                <label className="flex items-center gap-8">
                    <input type="checkbox" checked={fireLight} onChange={(e) => setFireLight(e.target.checked)} />
                    Fire light (B)
                </label>
            </div>

            <div className="grid gap-24 md:grid-cols-3">
                {approaches.map((approach) => (
                    <section key={approach.title} className="flex flex-col gap-10">
                        <div>
                            <h2 className="text-lg font-bold">{approach.title}</h2>
                            <p className="text-sm text-muted">{approach.note}</p>
                        </div>

                        <div
                            className="aspect-2/3 overflow-hidden rounded-2xl border border-border bg-cover bg-center"
                            style={{ backgroundImage: `url(${restaurantConfig.hero.background})` }}
                        >
                            {approach.stage}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
};

export default RotationLab;
