import ProductCard from "@/components/menu/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";
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

            <div className="mb-40 md:mb-64">
                <SectionTitle
                    id="best-sellers-title"
                    eyebrow="أطباقنا المفضّلة"
                    eyebrowIcon={LuFlame}
                    title="الأكثر **مبيعاً**"
                />
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
