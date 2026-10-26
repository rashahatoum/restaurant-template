import ProductCard from "@/components/menu/ProductCard";
import Slider from "@/components/ui/Slider";
import { getBestSellers } from "@/services/menu";
import { LuFlame } from "react-icons/lu";

// Server Component: data is fetched here, only the Slider ships JS.
const BestSellers = async () => {
    const products = await getBestSellers();

    if (products.length === 0) return null;

    return (
        <section
            aria-labelledby="best-sellers-title"
            className="isolate px-page-gutter py-80 md:py-120"
        >
            {/* =========================
                TITLE
            ========================== */}

            <div className="mb-40 flex flex-col items-center gap-12 text-center md:mb-64">
                <p className="flex items-center gap-8 text-sm font-bold text-primary md:text-base">
                    <LuFlame aria-hidden="true" className="text-lg" />
                    أطباقنا المفضّلة
                </p>

                <h2
                    id="best-sellers-title"
                    className="font-display text-4xl font-extrabold lg:text-5xl"
                >
                    الأكثر{" "}
                    <span className="inline-block">
                        مبيعاً
                        {/* Same orange underline as the hero name */}
                        <span
                            aria-hidden="true"
                            className="mt-2 block h-4 w-full -rotate-3 rounded-full bg-primary"
                        />
                    </span>
                </h2>
            </div>

            {/* =========================
                SLIDER
            ========================== */}

            <div className="relative">
                {/* Ember glow behind the center plate (the active card is always centered) */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-[10%] -z-10 mx-auto size-280 rounded-full bg-primary/25 blur-[100px] md:size-420 md:blur-[140px]"
                />

                <Slider label="الأكثر مبيعاً">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            name={product.name}
                            description={product.description}
                            image={product.image}
                            price={product.price}
                            href="/menu"
                        />
                    ))}
                </Slider>
            </div>
        </section>
    );
};

export default BestSellers;
