import type { Metadata } from "next";
import "./globals.css";
import { restaurantConfig } from "@/config/restaurant";
import { baseOpenGraph, defaultShareImage } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";
import { Tajawal, Playpen_Sans_Arabic} from "next/font/google";

const bodyFont = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
});

const displayFont = Playpen_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-playpen",
});


export const metadata: Metadata = {
  // Relative URLs in metadata (OG images, canonical) resolve against this.
  metadataBase: siteUrl,

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

  // Defaults for pages without their own (pages build theirs with lib/seo pageMetadata).
  openGraph: {
    ...baseOpenGraph,
    title: `${restaurantConfig.name} | ${restaurantConfig.seo.title}`,
    description: restaurantConfig.seo.description,
    images: [defaultShareImage],
  },

  twitter: { card: "summary_large_image" },
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
    data-scroll-behavior="smooth"
    className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}