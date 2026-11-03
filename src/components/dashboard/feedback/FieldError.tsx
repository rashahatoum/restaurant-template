import { FiAlertCircle } from "react-icons/fi";

interface FieldErrorProps {
    /** Point the input's aria-describedby at this id. */
    id: string;
    message?: string;
}

// The message under a field. Read by screen readers through the input's
// aria-describedby (no role="alert": focus moves to the first bad field).
const FieldError = ({ id, message }: FieldErrorProps) => {
    if (!message) return null;

    return (
        <p id={id} className="flex items-start gap-6 text-sm font-bold text-danger">
            <FiAlertCircle aria-hidden="true" className="mt-2 shrink-0" />
            {message}
        </p>
    );
};

export default FieldError;
