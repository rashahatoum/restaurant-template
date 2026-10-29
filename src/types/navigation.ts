/** A link to a section on the same page (category grid, section menu, chips). */
export interface SectionNavItem {
    /** id of the target section. */
    id: string;
    label: string;
    /** One emoji. */
    icon: string;
    /** Number of items in the section. */
    count: number;
}
