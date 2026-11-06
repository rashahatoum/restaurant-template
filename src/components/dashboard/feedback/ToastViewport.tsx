import type { ToastMessage } from "@/hooks/useToast";
import Toast from "./Toast";

interface ToastViewportProps {
    toast: (ToastMessage & { id: number }) | null;
    onClose: () => void;
}

// Fixed at the bottom, above everything. The live region is always in the
// page, so screen readers announce each toast as it appears.
const ToastViewport = ({ toast, onClose }: ToastViewportProps) => {
    return (
        <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-16 bottom-16 z-50 flex justify-center *:pointer-events-auto"
        >
            {toast && (
                <Toast
                    key={toast.id}
                    tone={toast.tone}
                    message={toast.message}
                    action={
                        toast.action && {
                            label: toast.action.label,
                            onClick: () => {
                                onClose();
                                toast.action?.onClick();
                            },
                        }
                    }
                    onClose={onClose}
                />
            )}
        </div>
    );
};

export default ToastViewport;
