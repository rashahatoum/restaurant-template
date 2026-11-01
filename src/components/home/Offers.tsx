import OfferCard from "@/components/menu/OfferCard";
import SectionTitle from "@/components/ui/SectionTitle";
import DetailsHint from "@/components/ui/DetailsHint";
import Slider from "@/components/ui/Slider";
import Link from "next/link";
import { toPlainText } from "@/lib/highlight";
import { getOffersContent } from "@/services/content";
import { FiGift } from "react-icons/fi";

// Server Component. Renders nothing when the section is off or has no active offers.
const Offers = async () => {
    const content = await getOffersContent();

    if (!content) return null;

    return (
        <section
            id="offers"
            aria-labelledby="offers-title"
            className="isolate px-page-gutter py-80 md:py-120"
        >
            <div className="mb-40 md:mb-64">
                <SectionTitle
                    id="offers-title"
                    eyebrow={content.eyebrow}
                    eyebrowIcon={FiGift}
                    title={content.title}
                />
            </div>

            <Slider
                label={toPlainText(content.title)}
                action={
                    <Link href="/menu" className="group">
                        <DetailsHint>عرض الكل</DetailsHint>
                    </Link>
                }
            >
                {content.offers.map((offer) => (
                    <OfferCard
                        key={offer.id}
                        title={offer.title}
                        items={offer.items}
                        freeItem={offer.freeItem}
                        price={offer.price}
                        image={offer.image}
                        badge={offer.badge}
                        href="/menu#category-offers"
                        detailsHref={`/menu/${offer.id}`}
                    />
                ))}
            </Slider>
        </section>
    );
};

export default Offers;
