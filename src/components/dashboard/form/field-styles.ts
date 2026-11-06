// Dashboard form controls. `aria-invalid` turns the border red, so callers
// only set the attribute.

export const inputClasses =
    "h-44 w-full rounded-full border border-border bg-background px-16 text-base placeholder:text-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 aria-[invalid=true]:border-danger";

export const textareaClasses =
    "w-full resize-none rounded-2xl border border-border bg-background p-12 text-base leading-relaxed placeholder:text-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 aria-[invalid=true]:border-danger";
