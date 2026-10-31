"use client";

import { useRef } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";

interface QuantityStepperProps {
    quantity: number;
    onIncrement: () => void;
    onDecrement: () => void;
    /** Item name, for the buttons' accessible labels. */
    itemLabel: string;
    /** At 0 only "+" shows; this text sits next to it from md (e.g. "أضف"). */
    addText?: string;
}

const buttonClasses =
    "flex size-36 shrink-0 items-center justify-center rounded-full text-lg transition-transform active:scale-90 motion-reduce:transition-none md:size-40";

// "+" alone at 0, "− n +" after. The "+" stays the same element in both
// states, so keyboard focus isn't lost when the first tap turns it into a
// stepper; going back to 0 moves focus to it.
const QuantityStepper = ({
    quantity,
    onIncrement,
    onDecrement,
    itemLabel,
    addText,
}: QuantityStepperProps) => {
    const plusRef = useRef<HTMLButtonElement>(null);
    const isEmpty = quantity === 0;

    const handleDecrement = () => {
        onDecrement();
        if (quantity === 1) plusRef.current?.focus();
    };

    return (
        <div
            className={`flex shrink-0 items-center rounded-full ${
                isEmpty ? "" : "gap-4 border border-primary/40 bg-background p-2"
            }`}
        >
            {!isEmpty && (
                <>
                    <button
                        type="button"
                        onClick={handleDecrement}
                        aria-label={quantity === 1 ? `شيل ${itemLabel} من السلة` : `نقّص ${itemLabel}`}
                        className={`${buttonClasses} text-primary hover:bg-primary/10`}
                    >
                        <FiMinus aria-hidden="true" />
                    </button>

                    <span className="min-w-20 text-center text-base font-extrabold tabular-nums">
                        <span className="sr-only">الكمية: </span>
                        {quantity}
                    </span>
                </>
            )}

            <button
                ref={plusRef}
                type="button"
                onClick={onIncrement}
                aria-label={isEmpty ? `أضف ${itemLabel} للسلة` : `زيد ${itemLabel}`}
                className={`${buttonClasses} gap-6 bg-primary text-background shadow-md shadow-primary/30 hover:scale-105 ${
                    isEmpty && addText ? "md:h-46 md:w-auto md:px-18 md:text-base md:font-extrabold" : ""
                }`}
            >
                <FiPlus aria-hidden="true" />
                {isEmpty && addText && <span className="hidden md:inline">{addText}</span>}
            </button>
        </div>
    );
};

export default QuantityStepper;
