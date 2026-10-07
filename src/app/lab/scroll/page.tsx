import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { restaurantConfig } from "@/config/restaurant";
import ScrollSequence, { type ScrollScene } from "@/components/lab/scroll/ScrollSequence";
import { spitFrames } from "@/components/lab/rotation/spit";

export const metadata: Metadata = {
    title: "Scroll lab",
    robots: { index: false, follow: false },
};

// Stand-in frames: a real version would use 150+ frames cut from one continuous video.
const frames = spitFrames.map((frame) => frame.src);

const { hero, seo, name } = restaurantConfig;

const scenes: ScrollScene[] = [
    { from: 0, to: 0.25, eyebrow: name, title: hero.headline, body: seo.description },
    ...hero.features.map((feature, index) => ({
        from: 0.25 * (index + 1),
        to: 0.25 * (index + 2),
        eyebrow: `0${index + 1}`,
        title: feature.label,
    })),
];

// Experiments only: never ship this page in a production build.
const ScrollLabPage = () => {
    if (process.env.NODE_ENV === "production") notFound();

    return (
        <main className="bg-background text-foreground">
            <section dir="ltr" className="flex h-dvh flex-col items-center justify-center gap-12 p-24 text-center">
                <h1 className="font-display text-4xl font-bold">Scroll storytelling lab</h1>
                <p className="max-w-xl text-muted">
                    Scroll down. The picture stays pinned and plays forward or backward with the scrollbar, while the
                    text changes by section. These are the 18 existing frames; a generated video cut into frames would
                    be much smoother.
                </p>
                <p className="text-sm text-primary">↓</p>
            </section>

            <ScrollSequence
                frames={frames}
                scenes={scenes}
                length={5}
                fit="contain"
                align="left"
                background={hero.background}
            />

            <section dir="ltr" className="flex h-dvh items-center justify-center p-24 text-muted">
                The sequence has ended and the page carries on normally from here.
            </section>
        </main>
    );
};

export default ScrollLabPage;
