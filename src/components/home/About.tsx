import Badge from "@/components/ui/Badge";
import HighlightedText from "@/components/ui/HighlightedText";
import RevealText from "@/components/ui/RevealText";
import SectionTitle from "@/components/ui/SectionTitle";
import { getAboutContent } from "@/services/content";
import Image from "next/image";
import { FiMapPin } from "react-icons/fi";

// Server Component. Mobile: image then text. md+: text (start) beside image (end).
const About = async () => {
    const about = await getAboutContent();

    return (
        <section
            id="about"
            aria-labelledby="about-title"
            className="overflow-x-clip px-page-gutter py-80 md:py-120"
        >
            <div className="grid items-center gap-40 md:grid-cols-2 md:gap-64 lg:gap-96">
                {/* =========================
                    TEXT
                ========================== */}

                <div className="order-2 flex flex-col gap-24 md:order-1">
                    <SectionTitle
                        id="about-title"
                        eyebrow={about.eyebrow}
                        title={about.title}
                        align="start"
                    />

                    <div className="flex flex-col gap-16 text-base leading-loose text-foreground/85 lg:text-lg">
                        {about.paragraphs.map((paragraph) => (
                            <p key={paragraph}>
                                <HighlightedText text={paragraph} />
                            </p>
                        ))}
                    </div>

                    <blockquote className="border-s-4 border-primary ps-16 font-display text-xl leading-relaxed font-bold lg:text-2xl">
                        <RevealText text={about.closing} />
                    </blockquote>
                </div>

                {/* =========================
                    IMAGE
                ========================== */}

                <div className="reveal-zoom relative isolate order-1 mx-auto w-full max-w-380 md:order-2 md:max-w-520">
                    {/* Orange glow behind the photo: shows through its faded edges */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-[5%] -z-10 rounded-full bg-primary/45 blur-[60px]"
                    />

                    {/* Edges fade into the page background instead of a hard frame */}
                    <div className="relative aspect-4/5 w-full mask-[radial-gradient(ellipse_at_center,black_55%,transparent_75%)]">
                        <Image
                            src={about.image.src}
                            alt={about.image.alt}
                            fill
                            sizes="(min-width: 768px) 520px, 380px"
                            className="object-cover"
                        />
                    </div>

                    {about.badge && (
                        <div className="absolute inset-x-0 bottom-24 flex justify-center">
                            <Badge icon={FiMapPin}>{about.badge}</Badge>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default About;
