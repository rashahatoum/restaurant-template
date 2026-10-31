// Mock menu for Ahl Al Karam. Only src/services/ may import this file.
// Prices are in SYP. Chicken/meat shawarma and grilled chicken prices come
// from the owner; the rest (meals, size deltas) are placeholders until the
// owner sets them from the dashboard.

import type { Category, Product, ProductOptionGroup } from "@/types/menu";

const IMAGES_PATH = "/assets/imgs/menu";
const CATEGORY_IMAGES_PATH = "/assets/imgs/categories";

export const categories: readonly Category[] = [
    {
        id: "sandwiches",
        name: "سندويشات",
        image: `${CATEGORY_IMAGES_PATH}/sandwiches.webp`,
        order: 1,
    },
    { id: "meals", name: "وجبات", image: `${CATEGORY_IMAGES_PATH}/meals.webp`, order: 2 },
    { id: "chicken", name: "فروج", image: `${CATEGORY_IMAGES_PATH}/chickens.webp`, order: 3 },
];

/* =========================
   SHARED OPTION GROUPS
========================= */

/** Shawarma sandwiches only. */
const shawarmaSizes: ProductOptionGroup = {
    id: "size",
    name: "الحجم",
    required: true,
    maxSelect: 1,
    options: [
        { id: "regular", name: "عادي", priceDelta: 0 },
        { id: "double", name: "دبل", priceDelta: 100 },
        {
            id: "double-samoon",
            name: "دبل بخبز السمون",
            shortName: "دبل سمون",
            priceDelta: 150,
        },
    ],
};

/* =========================
   PRODUCTS
========================= */

export const products: readonly Product[] = [
    // Sandwiches
    {
        id: "chicken-shawarma",
        categoryId: "sandwiches",
        name: "شاورما جاج",
        description: "شاورما دجاج متبّل على السيخ، ملفوفة بخبز الصاج.",
        ingredients: ["دجاج متبّل", "ثوم", "مخلل", "بطاطا", "خبز صاج"],
        price: 250,
        image: `${IMAGES_PATH}/chicken-shawarma.webp`,
        isBestSeller: false,
        isAvailable: true,
        optionGroups: [shawarmaSizes],
    },
    {
        id: "meat-shawarma",
        categoryId: "sandwiches",
        name: "شاورما لحم",
        description: "لحم متبّل بخلطة أهل الكرم الخاصة مع الطحينة.",
        ingredients: ["لحم متبّل", "طحينة", "بندورة", "بقدونس", "بصل", "خبز صاج"],
        price: 300,
        image: `${IMAGES_PATH}/meat-shawarma.webp`,
        isBestSeller: false,
        isAvailable: true,
        optionGroups: [shawarmaSizes],
    },
    {
        id: "crispy",
        categoryId: "sandwiches",
        name: "كرسبي",
        description: "قطع صدر دجاج مقرمشة بخلطة البهارات الخاصة.",
        ingredients: ["قطع صدر مقرمشة", "ثوم", "مخلل", "خبز سمون"],
        price: 350,
        image: `${IMAGES_PATH}/crispy.webp`,
        isBestSeller: false,
        isAvailable: true,
    },
    {
        id: "zinger",
        categoryId: "sandwiches",
        name: "زنجر",
        description: "قطع زنجر حارة مع جبنة سايحة.",
        ingredients: ["قطع زنجر حارة", "جبنة سايحة", "شرائح جامبون", "كول سلو", "خبز سمون"],
        price: 400,
        image: `${IMAGES_PATH}/zinger.webp`,
        isBestSeller: false,
        isAvailable: true,
    },
    {
        id: "fries",
        categoryId: "sandwiches",
        name: "سندويشة بطاطا",
        description: "بطاطا مقلية مقرمشة مع الكاتشب والكول سلو بخبز السمون.",
        ingredients: ["بطاطا مقلية", "كاتشب", "كول سلو", "مايونيز", "مخلل", "خبز سمون"],
        price: 250,
        image: `${IMAGES_PATH}/fries.webp`,
        isBestSeller: false,
        isAvailable: true,
    },

    // Meals
    {
        id: "chicken-shawarma-meal",
        categoryId: "meals",
        name: "وجبة شاورما جاج",
        description: "شاورما دجاج مقطّعة مع البطاطا والثوم والمخلل.",
        ingredients: ["شاورما جاج مقطّعة", "بطاطا", "ثوم", "مخلل"],
        price: 450,
        image: `${IMAGES_PATH}/chicken-shawarma-meal.webp`,
        isBestSeller: true,
        isAvailable: true,
    },
    {
        id: "meat-shawarma-meal",
        categoryId: "meals",
        name: "وجبة شاورما لحم",
        description: "شاورما لحم مقطّعة مع الطحينة والبطاطا.",
        ingredients: ["شاورما لحم مقطّعة", "طحينة", "بطاطا", "مخلل"],
        price: 500,
        image: `${IMAGES_PATH}/meat-shawarma-meal.webp`,
        isBestSeller: true,
        isAvailable: true,
    },
    {
        id: "crispy-meal",
        categoryId: "meals",
        name: "وجبة كرسبي",
        description: "قطع كرسبي مقرمشة مع البطاطا والثوم.",
        ingredients: ["قطع كرسبي", "بطاطا", "ثوم", "مخلل"],
        price: 550,
        image: `${IMAGES_PATH}/crispy-meal.webp`,
        isBestSeller: false,
        isAvailable: true,
    },
    {
        id: "zinger-meal",
        categoryId: "meals",
        name: "وجبة زنجر",
        description: "قطع زنجر حارة مع جبنة سايحة وبطاطا.",
        ingredients: ["قطع زنجر حارة", "جبنة سايحة", "بطاطا", "كول سلو"],
        price: 600,
        image: `${IMAGES_PATH}/zinger-meal.webp`,
        isBestSeller: true,
        isAvailable: true,
    },

    // Whole chicken
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
];
