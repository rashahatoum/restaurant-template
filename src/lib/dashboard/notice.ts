// What a form just did, carried back to its list in the URL (?done=&name=)
// and shown there once as a toast. Pure, so server pages can validate it.

export type DoneAction = "added" | "saved" | "deleted";

export interface DoneNotice {
    done: DoneAction;
    name: string;
}

const DONE_ACTIONS: readonly DoneAction[] = ["added", "saved", "deleted"];

/** The notice from search params, or undefined when they're missing or unknown. */
export function readNotice(done: string | undefined, name: string | undefined): DoneNotice | undefined {
    const action = DONE_ACTIONS.find((value) => value === done);
    return action && name ? { done: action, name } : undefined;
}

/** The list URL with the notice appended (`base` may already have a query). */
export function withNotice(base: string, done: DoneAction, name: string): string {
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}done=${done}&name=${encodeURIComponent(name)}`;
}

export const NOTICE_TEXT: Record<DoneAction, (name: string) => string> = {
    added: (name) => `انضاف ${name}`,
    saved: (name) => `انحفظ ${name}`,
    deleted: (name) => `انحذف ${name}`,
};
