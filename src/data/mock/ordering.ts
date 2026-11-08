// Ordering settings for Ahl Al Karam. Only src/services/ may import this file.
// The delivery fee comes from the owner; table counts are a placeholder (10
// per branch) until the owner sets the real ones. Numbers live in site-info.ts.

import type { OrderingSettings } from "@/types/order";

export const ordering: OrderingSettings = {
    delivery: {
        isEnabled: true,
        fee: 150,
        phoneId: "phone-1",
    },
    dineIn: {
        isEnabled: true,
        branches: [
            { branchId: "qanawat-road", isEnabled: true, tableCount: 10 },
            { branchId: "al-mehwari", isEnabled: true, tableCount: 10 },
        ],
    },
    message: {
        greeting: "مرحبا {restaurant}، بدي اطلب:",
        closing: "شكراً إلكن، ورح شاركن رأيي بالتجربة بعد ما يوصل الطلب.",
    },
    thankYou:
        "شكراً {name}! طلبك صار جاهز عالواتساب، بس تأكد إنك كبست إرسال. وبعد ما تجرّب، شاركنا رأيك بالتجربة، رأيك بيهمنا.",
};
