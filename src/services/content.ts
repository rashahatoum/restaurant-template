// Editable page content. Same contract as services/menu.ts: async today over
// mock data, later the dashboard/API behind the same signatures.

import { about } from "@/data/mock/about";
import type { AboutContent } from "@/types/content";

export async function getAboutContent(): Promise<AboutContent> {
    return about;
}
