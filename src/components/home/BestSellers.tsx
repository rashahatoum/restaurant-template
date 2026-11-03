import ProductCard from "@/components/menu/ProductCard";
import SectionTitle from "@/components/ui/SectionTitle";
import DetailsHint from "@/components/ui/DetailsHint";
import Slider from "@/components/ui/Slider";
import Link from "next/link";
import { getBestSellers } from "@/services/menu";
import { LuFlame } from "react-icons/lu";

// Server Component: data is fetched here, only the Slider ships JS.
const BestSellers = async () => {
    const products = await getBestSellers();

    if (products.length === 0) return null;

    return (
        <section
            aria-labelledby="best-sellers-title"
            className="isolate px-page-gutter py-56 md:py-80"
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
                    action={
                        <Link href="/menu" className="group">
                            <DetailsHint>عرض الكل</DetailsHint>
                        </Link>
                    }
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
                            imageStyle={product.imageStyle}
                            price={product.price}
                            href={`/menu/${product.id}`}
                            showDetailsHint={product.ingredients.length > 0}
                        />
                    ))}
                </Slider>
            </div>
        </section>
    );
};

export default BestSellers;
