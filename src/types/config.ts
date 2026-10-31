// Shape every restaurant config must satisfy (src/config/restaurant.ts).

/** Must match a [data-theme="…"] block in globals.css. */
export type ThemeName = "fire";

/** Keys mapped to icon components in Hero (featureIcons). */
export type FeatureIconKey = "fresh" | "fire" | "quality";

export interface Action {
    label: string;
    href: string;
}

/** Page (/menu) or home-page section (/#about); only pages get the "current" underline. */
export type NavLink = Action;

export interface RestaurantConfig {
    name: string;
    logo: string;

    navbar: {
        links: readonly NavLink[];
        orderAction: Action;
    };

    seo: {
        title: string;
        description: string;
        keywords: readonly string[];
    };

    /** Currency of every price in the menu data. */
    currency: {
        code: string;
        label: string;
    };

    theme: ThemeName;

    hero: {
        /** Fire texture behind the menu banner slides (the hero itself uses `backdrop`). */
        background: string;
        headline: string;
        primaryAction: Action;
        secondaryAction: Action;

        /**
         * Hero backdrop, one photo per orientation (art direction: the browser
         * downloads only the one it shows). Dark on the text side, glow behind the spit.
         */
        backdrop: {
            desktop: { src: string; width: number; height: number };
            mobile: { src: string; width: number; height: number };
        };

        /** The 3D-turning spit (components/motion/HeroSpit). */
        spit: {
            /** Front view of the whole spit on a transparent background. */
            image: { src: string; alt: string; width: number; height: number };
            /** One spin session (on load, hover, tap). Speed in °/s, times in seconds. */
            motion: { speed: number; easeIn: number; hold: number; easeOut: number };
        };

        features: readonly {
            label: string;
            icon: FeatureIconKey;
        }[];
    };
}
