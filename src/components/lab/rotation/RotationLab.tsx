"use client";

import { useState } from "react";
import { restaurantConfig } from "@/config/restaurant";
import PhotoLathe from "./PhotoLathe";

interface SliderProps {
    label: string;
    unit: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}

const Slider = ({ label, unit, value, min, max, step, onChange }: SliderProps) => (
    <label className="flex flex-col gap-4">
        <span>
            {label}: <strong className="text-primary">{value}</strong> {unit}
        </span>
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </label>
);

// Lab for the hero spit (approach B, rebuilt on one photo): tune the spin
// session here, then the values move into the config with the production component.
const RotationLab = () => {
    // Defaults = the owner's picks.
    const [speed, setSpeed] = useState(30);
    const [easeIn, setEaseIn] = useState(1);
    const [hold, setHold] = useState(4);
    const [easeOut, setEaseOut] = useState(2.5);
    const [fireLight, setFireLight] = useState(true);
    const [spinSignal, setSpinSignal] = useState(0);

    const total = easeIn + hold + easeOut;

    return (
        <div dir="ltr" className="min-h-dvh bg-background p-16 font-body text-foreground md:p-32">
            <header className="mb-24 flex flex-col gap-6">
                <h1 className="font-display text-3xl font-bold">Spit rotation lab</h1>
                <p className="text-muted">
                    The spit turns once on load and stops. Hover (mouse) or click/tap spins it again. Only
                    available in development.
                </p>
            </header>

            <div className="flex flex-col gap-24 md:flex-row md:items-start">
                <div className="grid w-full max-w-320 gap-16 rounded-2xl border border-border bg-surface p-16 text-sm">
                    <Slider label="Speed" unit="°/s" value={speed} min={10} max={180} step={5} onChange={setSpeed} />
                    <Slider label="Speed up" unit="s" value={easeIn} min={0.2} max={4} step={0.1} onChange={setEaseIn} />
                    <Slider label="Turning" unit="s" value={hold} min={0} max={12} step={0.5} onChange={setHold} />
                    <Slider label="Slow down" unit="s" value={easeOut} min={0.5} max={6} step={0.1} onChange={setEaseOut} />

                    <p className="text-muted">
                        One spin ≈ {total.toFixed(1)} s, about {Math.round((speed * (hold + (easeIn + easeOut) / 2)) / 36) / 10}{" "}
                        turns.
                    </p>

                    <label className="flex items-center gap-8">
                        <input type="checkbox" checked={fireLight} onChange={(e) => setFireLight(e.target.checked)} />
                        Fire light
                    </label>

                    <button
                        type="button"
                        onClick={() => setSpinSignal((n) => n + 1)}
                        className="rounded-full bg-primary px-16 py-8 font-bold text-background"
                    >
                        Spin again
                    </button>
                </div>

                <div
                    className="aspect-2/3 w-full max-w-420 overflow-hidden rounded-2xl border border-border bg-cover bg-center"
                    style={{ backgroundImage: `url(${restaurantConfig.hero.backdrop.desktop.src})` }}
                >
                    <PhotoLathe spin={{ speed, easeIn, hold, easeOut }} fireLight={fireLight} spinSignal={spinSignal} />
                </div>
            </div>
        </div>
    );
};

export default RotationLab;
