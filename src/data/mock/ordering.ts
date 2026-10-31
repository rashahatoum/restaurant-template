// Ordering settings for Ahl Al Karam. Only src/services/ may import this file.
// Numbers and the delivery fee come from the owner; table counts are a
// placeholder (10 per branch) until the owner sets the real ones.

import type { OrderingSettings } from "@/types/order";

export const ordering: OrderingSettings = {
    delivery: {
        isEnabled: true,
        fee: 150,
        whatsApp: "+963930539614",
    },
    dineIn: {
        isEnabled: true,
        branches: [
            { branchId: "qanawat-road", isEnabled: true, tableCount: 10, whatsApp: "+963980785608" },
            { branchId: "al-mehwari", isEnabled: true, tableCount: 10, whatsApp: "+963980785608" },
        ],
    },
    message: {
        greeting: "مرحبا {restaurant}، بدي اطلب:",
        closing: "شكراً إلكن، ورح شاركن رأيي بالتجربة بعد ما يوصل الطلب.",
    },
    thankYou:
        "شكراً {name}! طلبك صار جاهز عالواتساب، بس تأكد إنك كبست إرسال. وبعد ما تجرّب، شاركنا رأيك بالتجربة، رأيك بيهمنا.",
};
