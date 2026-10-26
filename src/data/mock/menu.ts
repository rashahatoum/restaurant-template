// Mock menu for Ahl Al Karam. Only src/services/ may import this file.
// Prices are in SYP. Chicken/meat shawarma and grilled chicken prices come
// from the owner; the rest are realistic placeholders until the real menu.

import type { Category, Product, ProductOptionGroup } from "@/types/menu";

const IMAGES_PATH = "/assets/imgs/menu";

export const categories: readonly Category[] = [
    { id: "shawarma", name: "شاورما", order: 1 },
    { id: "chicken", name: "فروج", order: 2 },
    { id: "crispy", name: "مقرمشات", order: 3 },
];

/* =========================
   SHARED OPTION GROUPS
========================= */

const sizeOptions: ProductOptionGroup = {
    id: "size",
    name: "الحجم",
    required: true,
    maxSelect: 1,
    options: [
        { id: "sandwich", name: "صندويشة", priceDelta: 0 },
        { id: "meal", name: "وجبة (مع بطاطا وكولا)", priceDelta: 150 },
    ],
};

const extrasOptions: ProductOptionGroup = {
    id: "extras",
    name: "إضافات",
    required: false,
    maxSelect: 2,
    options: [
        { id: "extra-garlic", name: "ثوم إضافي", priceDelta: 25 },
        { id: "cheese", name: "جبنة", priceDelta: 50 },
    ],
};

/* =========================
   PRODUCTS
========================= */

export const products: readonly Product[] = [
    {
        id: "chicken-shawarma",
        categoryId: "shawarma",
        name: "شاورما جاج",
        description: "شاورما دجاج متبّل على السيخ، ملفوفة بخبز الصاج.",
        ingredients: ["دجاج متبّل", "ثوم", "مخلل", "بطاطا", "خبز صاج"],
        price: 250,
        image: `${IMAGES_PATH}/chicken-shawarma.webp`,
        isBestSeller: true,
        isAvailable: true,
        optionGroups: [sizeOptions, extrasOptions],
    },
    {
        id: "meat-shawarma",
        categoryId: "shawarma",
        name: "شاورما لحم",
        description: "لحم متبّل بخلطة أهل الكرم الخاصة مع الطحينة.",
        ingredients: ["لحم متبّل", "طحينة", "بندورة", "بقدونس", "بصل", "خبز صاج"],
        price: 300,
        image: `${IMAGES_PATH}/meat-shawarma.webp`,
        isBestSeller: true,
        isAvailable: true,
        optionGroups: [sizeOptions, extrasOptions],
    },
    {
        id: "grilled-chicken",
        categoryId: "chicken",
        name: "فروج مشوي",
        description: "فروج كامل مشوي على الفحم، يقدَّم مع الثوم والبطاطا.",
        ingredients: ["فروج كامل", "ثوم", "بطاطا", "مخلل", "خبز"],
        price: 1250,
        image: `${IMAGES_PATH}/grilled-chicken.webp`,
        isBestSeller: true,
        isAvailable: true,
    },
    {
        id: "broasted-chicken",
        categoryId: "chicken",
        name: "فروج بروستد",
        description: "8 قطع فروج بروستد مقرمشة من برّا وطرية من جوّا.",
        ingredients: ["8 قطع بروستد", "ثوم", "بطاطا", "كول سلو", "خبز"],
        price: 1200,
        image: `${IMAGES_PATH}/broasted-chicken.webp`,
        isBestSeller: false,
        isAvailable: true,
    },
    {
        id: "crispy",
        categoryId: "crispy",
        name: "كرسبي",
        description: "قطع صدر دجاج مقرمشة بخلطة البهارات الخاصة.",
        ingredients: ["قطع صدر مقرمشة", "ثوم", "مخلل", "بطاطا"],
        price: 350,
        image: `${IMAGES_PATH}/crispy.webp`,
        isBestSeller: false,
        isAvailable: true,
        optionGroups: [sizeOptions, extrasOptions],
    },
    {
        id: "zinger",
        categoryId: "crispy",
        name: "زنجر",
        description: "صدر دجاج حار ومقرمش بخبز البرغر.",
        ingredients: ["صدر دجاج حار مقرمش", "خس", "مايونيز", "جبنة", "خبز برغر"],
        price: 400,
        image: `${IMAGES_PATH}/zinger.webp`,
        isBestSeller: true,
        isAvailable: true,
        optionGroups: [sizeOptions, extrasOptions],
    },
];
