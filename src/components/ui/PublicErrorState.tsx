import type { ReactNode } from "react";

interface PublicErrorStateProps {
    title: string;
    message: string;
    /** Buttons and links (retry, «تواصل معنا»…). */
    children: ReactNode;
    /** Room for the fixed NavBar above (pages inside the site layout). */
    underNavBar?: boolean;
}

// What a customer sees when a public page can't load (error.tsx files). Hook-free:
// the error boundaries (client components) pass their retry button in.
const PublicErrorState = ({ title, message, children, underNavBar = true }: PublicErrorStateProps) => (
    <main
        className={`flex min-h-[70dvh] flex-col items-center justify-center gap-16 px-page-gutter pb-80 text-center ${
            underNavBar ? "pt-160" : "pt-80"
        }`}
    >
        <h1 className="font-display text-2xl font-bold md:text-4xl">{title}</h1>
        <p className="max-w-420 text-muted">{message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-12">{children}</div>
    </main>
);

export const primaryActionClasses = "rounded-full bg-primary px-24 py-10 font-bold text-background transition-opacity hover:opacity-90";
export const secondaryActionClasses =
    "rounded-full border border-border px-24 py-10 font-bold transition-colors hover:border-primary hover:text-primary";

export default PublicErrorState;
