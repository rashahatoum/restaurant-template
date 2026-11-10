"use client";

import { FiPrinter } from "react-icons/fi";

// Opens the browser's print dialog (A4, or "Save as PDF").
const PrintButton = () => {
    return (
        <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-44 items-center gap-8 rounded-full bg-primary px-20 font-extrabold text-background transition-opacity hover:opacity-90"
        >
            <FiPrinter aria-hidden="true" />
            اطبع
        </button>
    );
};

export default PrintButton;
