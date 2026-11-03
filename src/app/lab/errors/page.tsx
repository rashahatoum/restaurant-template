import ErrorsLab from "@/components/lab/errors/ErrorsLab";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
    title: "Errors lab",
    robots: { index: false, follow: false },
};

// Every dashboard error message and component, for review. Dev only.
const ErrorsLabPage = () => {
    if (process.env.NODE_ENV === "production") notFound();

    return <ErrorsLab />;
};

export default ErrorsLabPage;
