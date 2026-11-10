# البنية الحالية

## Tech Stack

- Next.js `16.3.5` باستخدام App Router داخل `src/app`.
- React `19.2.8` وReact DOM `19.2.8`.
- TypeScript بوضع `strict` ومسار مختصر `@/*` إلى `src/*`.
- Tailwind CSS `4` عبر `@tailwindcss/postcss` و`@import "tailwindcss"`.
- `react-icons` للأيقونات.
- `next/font/google` لخطي Tajawal وPlaypen Sans Arabic.

## بنية الملفات الفعلية

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── home/
│   │   └── Hero.tsx
│   └── layout/
│       └── NavBar.tsx
└── config/
    └── restaurant.ts

public/assets/imgs/
├── ahl-alkaram-logo.webp
├── nav-mobile-bg.webp
└── shawrma-hero.webp
```

## مسؤوليات الأجزاء

- `app/layout.tsx`: الجذر العام؛ يضبط `lang="ar"` و`dir="rtl"`، يحمّل الخطوط، يحدد الثيم من إعداد المطعم، ويولّد Metadata الأساسية.
- `app/page.tsx`: الصفحة الرئيسية الحالية؛ تعرّف روابط التنقّل وتجمع `NavBar` و`Hero`. على الشاشات المتوسطة فما فوق يشتركان في Grid يغطي أول شاشة، ليبدأ أصل الـHero من أعلى الصفحة مع بقاء شريط التنقّل في الطبقة التفاعلية الأعلى.
- `components/home/Hero.tsx`: Server Component يعرض مقدمة الصفحة وإجراءات القائمة في عمود محتوى وعمود صورة باستخدام Flex. يحصل المحتوى فقط على مساحة علوية تعادل شريط التنقّل، بينما تمتد صورة السيخ من أعلى الشاشة دون positional layout.
- `components/layout/NavBar.tsx`: Client Component بسبب حالة فتح قائمة الجوال. يعرض الشعار والروابط وزر الطلب لسطح المكتب والجوال.
- `config/restaurant.ts`: المصدر المركزي الحالي لاسم المطعم والشعار وSEO وحقول التواصل والثيم ومحتوى وأصل الـHero وأبعاده الأصلية.
- `app/globals.css`: يربط design tokens الخاصة بـTailwind مع CSS variables، ويعرّف قيم ثيم `fire` وpage gutter المشتركة.

## Server وClient Components

- `layout.tsx` و`page.tsx` و`Hero.tsx` Server Components افتراضيًا.
- `NavBar.tsx` هو Client Component الوحيد حاليًا، ويستخدم `useState` لتفاعل قائمة الجوال.

## الإعداد والثيم

يضبط `layout.tsx` قيمة `data-theme` من `restaurantConfig.theme`. يعرّف `globals.css` متغيرات الثيم تحت `[data-theme="fire"]`، ثم يعرّضها كألوان وخطوط دلالية عبر `@theme`. تستخدم المكوّنات أسماء مثل `bg-primary` و`text-foreground` بدل تكرار قيم الهوية غالبًا.

الوضع الحالي ليس نظام multi-tenant أو تحميلًا ديناميكيًا للإعدادات؛ إنه إعداد TypeScript محلي واحد وثيم واحد معرّف فعليًا.

## البيانات والتكامل

لا توجد طبقة بيانات أو Backend أو API حاليًا. جميع البيانات الموجودة ثابتة في ملفات الواجهة، وحقول التواصل في الإعداد المركزي فارغة.
