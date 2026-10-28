import ReviewCard from "@/components/reviews/ReviewCard";
import SectionTitle from "@/components/ui/SectionTitle";
import Slider from "@/components/ui/Slider";
import { toPlainText } from "@/lib/highlight";
import { getReviewsContent } from "@/services/content";
import { FiMessageCircle } from "react-icons/fi";

// Server Component. Renders nothing when the section is off or has no visible reviews.
const Reviews = async () => {
    const content = await getReviewsContent();

    if (!content) return null;

    return (
        <section
            id="reviews"
            aria-labelledby="reviews-title"
            className="isolate px-page-gutter py-80 md:py-120"
        >
            <div className="mb-40 md:mb-64">
                <SectionTitle
                    id="reviews-title"
                    eyebrow={content.eyebrow}
                    eyebrowIcon={FiMessageCircle}
                    title={content.title}
                />
            </div>

            <Slider label={toPlainText(content.title)}>
                {content.reviews.map((review) => (
                    <ReviewCard
                        key={review.id}
                        customerName={review.customerName}
                        question={review.question ?? content.defaultQuestion}
                        answer={review.answer}
                        time={review.time}
                    />
                ))}
            </Slider>
        </section>
    );
};

export default Reviews;
