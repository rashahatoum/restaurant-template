import { FiLoader } from "react-icons/fi";

interface SaveBarProps {
    /** Shown only when there's something to save. */
    isDirty: boolean;
    isSaving: boolean;
    /** "احفظ" or "أضف الصنف". */
    submitLabel: string;
    onDiscard: () => void;
}

// Sticky at the bottom of a form, only once something changed. The submit
// button submits the surrounding <form>.
const SaveBar = ({ isDirty, isSaving, submitLabel, onDiscard }: SaveBarProps) => {
    if (!isDirty && !isSaving) return null;

    return (
        <div className="sticky bottom-0 z-20 -mx-16 border-t border-border bg-background/95 px-16 py-12 backdrop-blur-sm">
            <div className="mx-auto flex max-w-560 items-center gap-10">
                <button
                    type="button"
                    onClick={onDiscard}
                    disabled={isSaving}
                    // Smaller text on phones: "تجاهل التعديلات" overflowed the narrow button
                    className="h-46 flex-1 whitespace-nowrap rounded-full border border-border px-10 text-sm font-bold transition-colors hover:border-primary hover:text-primary disabled:opacity-50 md:text-base"
                >
                    تجاهل التعديلات
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex h-46 flex-[2] items-center justify-center gap-8 rounded-full bg-primary font-extrabold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                    {isSaving && <FiLoader aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
                    {isSaving ? "عم نحفظ…" : submitLabel}
                </button>
            </div>
        </div>
    );
};

export default SaveBar;
