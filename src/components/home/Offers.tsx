import OfferCard from "@/components/menu/OfferCard";
import SectionTitle from "@/components/ui/SectionTitle";
import Slider from "@/components/ui/Slider";
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

            <Slider label={toPlainText(content.title)}>
                {content.offers.map((offer) => (
                    <OfferCard
                        key={offer.id}
                        title={offer.title}
                        items={offer.items}
                        freeItem={offer.freeItem}
                        price={offer.price}
                        image={offer.image}
                        badge={offer.badge}
                        href="/menu"
                    />
                ))}
            </Slider>
        </section>
    );
};

export default Offers;
