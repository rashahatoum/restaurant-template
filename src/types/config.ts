// Shape every restaurant config must satisfy (src/config/restaurant.ts).

/** Must match a [data-theme="…"] block in globals.css. */
export type ThemeName = "fire";

/** Keys mapped to icon components in NavBar (navIcons). */
export type NavIconKey = "home" | "menu" | "about" | "location" | "contact";

/** Keys mapped to icon components in Hero (featureIcons). */
export type FeatureIconKey = "fresh" | "fire" | "quality";

export interface Action {
    label: string;
    href: string;
}

export interface NavLink extends Action {
    icon: NavIconKey;
}

export interface RestaurantConfig {
    name: string;
    logo: string;

    navbar: {
        mobileBackground: string;
        links: readonly NavLink[];
        orderAction: Action;
    };

    seo: {
        title: string;
        description: string;
        keywords: readonly string[];
    };

    contact: {
        phone: string;
        whatsapp: string;
        address: string;
    };

    theme: ThemeName;

    hero: {
        background: string;
        headline: string;
        primaryAction: Action;
        secondaryAction: Action;

        // Provisional: Phase 6 replaces this with the hero motion config.
        media: {
            type: "image-sequence";
            animation: {
                framesPath: string;
                filePrefix: string;
                fileExtension: string;
                frameStep: number;
                startAngle: number;
                endAngle: number;
                frameDuration: number;
                autoPlay: boolean;
                autoPlayDelay: number;
                interaction: {
                    hover: boolean;
                    click: boolean;
                };
            };
            image: {
                alt: string;
                width: number;
                height: number;
            };
        };

        features: readonly {
            label: string;
            icon: FeatureIconKey;
        }[];
    };
}
