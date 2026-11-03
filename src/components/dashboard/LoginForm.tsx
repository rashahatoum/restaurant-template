"use client";

import { login, type LoginState } from "@/app/(dashboard)/dashboard/actions";
import AppErrorAlert from "@/components/dashboard/feedback/AppErrorAlert";
import { useActionState, useState } from "react";
import { FiEye, FiEyeOff, FiLoader } from "react-icons/fi";

interface LoginFormProps {
    /** Page to return to after signing in (checked again on the server). */
    next?: string;
}

const fieldClasses =
    "h-48 w-full rounded-full border border-border bg-background text-base placeholder:text-muted/70 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
const labelClasses = "flex flex-col gap-6 text-sm font-bold";

// Native form posting to a Server Action: works before JS loads, and
// useActionState gives the error and the pending state.
const LoginForm = ({ next }: LoginFormProps) => {
    const [state, formAction, isPending] = useActionState<LoginState, FormData>(login, {});
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form action={formAction} className="flex flex-col gap-16">
            {next && <input type="hidden" name="next" value={next} />}

            {state.error && <AppErrorAlert error={state.error} />}

            <label className={labelClasses}>
                اسم المستخدم
                <input
                    name="username"
                    required
                    autoComplete="username"
                    autoFocus
                    // Kept after a failed try (React resets the form after an action)
                    defaultValue={state.username}
                    className={`${fieldClasses} px-18`}
                />
            </label>

            <label className={labelClasses}>
                كلمة السر
                <span className="relative">
                    <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete="current-password"
                        // LTR input inside an RTL page: its start (left) is where the eye button sits
                        dir="ltr"
                        className={`${fieldClasses} ps-48 pe-18 text-end`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "خبّي كلمة السر" : "اعرض كلمة السر"}
                        aria-pressed={showPassword}
                        className="absolute inset-e-6 top-1/2 flex size-36 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:text-primary"
                    >
                        {showPassword ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                    </button>
                </span>
            </label>

            <button
                type="submit"
                disabled={isPending}
                className="mt-4 flex h-50 items-center justify-center gap-8 rounded-full bg-primary font-extrabold text-background transition-opacity hover:opacity-90 disabled:opacity-60"
            >
                {isPending && <FiLoader aria-hidden="true" className="animate-spin motion-reduce:animate-none" />}
                {isPending ? "عم نتحقق…" : "تسجيل الدخول"}
            </button>
        </form>
    );
};

export default LoginForm;
