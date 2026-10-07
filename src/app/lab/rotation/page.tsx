import { notFound } from "next/navigation";
import type { Metadata } from "next";
import RotationLab from "@/components/lab/rotation/RotationLab";

export const metadata: Metadata = {
    title: "Rotation lab",
    robots: { index: false, follow: false },
};

// Experiments only: never ship this page in a production build.
const RotationLabPage = () => {
    if (process.env.NODE_ENV === "production") notFound();

    return <RotationLab />;
};

export default RotationLabPage;
