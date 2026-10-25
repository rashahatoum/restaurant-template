import type { Metadata } from "next";
import "./globals.css";
import { restaurantConfig } from "@/config/restaurant";
import { Tajawal, Playpen_Sans_Arabic} from "next/font/google";

const bodyFont = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
});

const displayFont = Playpen_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-playpen",
});


export const metadata: Metadata = {
  title: {
    default: `${restaurantConfig.name} | ${restaurantConfig.seo.title}`,
    template: `%s | ${restaurantConfig.name}`,
  },

  description: restaurantConfig.seo.description,

  keywords: [...restaurantConfig.seo.keywords],

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
    lang="ar" 
    dir="rtl"
    data-theme={restaurantConfig.theme}
    className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}