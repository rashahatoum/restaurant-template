import ItemDetails from "@/components/menu/ItemDetails";
import RouteModal from "@/components/ui/RouteModal";
import { getMenuItem, getMenuItemIds } from "@/services/menu";
import { notFound } from "next/navigation";

interface ItemModalProps {
    params: Promise<{ itemId: string }>;
}

// Same ids as the standalone page, so the slot stays static too.
export async function generateStaticParams() {
    const ids = await getMenuItemIds();
    return ids.map((itemId) => ({ itemId }));
}

// Intercepts /menu/<id> on client navigation from any (site) page and shows
// the photo and its parts over that page (any tap closes it). A refresh or
// shared link gets the full page, with price and add button.
const ItemModal = async ({ params }: ItemModalProps) => {
    const item = await getMenuItem((await params).itemId);
    if (!item) notFound();

    const headingId = `item-${item.id}-title`;

    return (
        <RouteModal labelledBy={headingId}>
            <ItemDetails item={item} headingLevel="h2" headingId={headingId} variant="focus" />
        </RouteModal>
    );
};

export default ItemModal;
