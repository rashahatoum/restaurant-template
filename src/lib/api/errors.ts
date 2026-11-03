// One error model for the whole dashboard: Laravel responses, network
// failures and local checks all become an AppError with an Arabic message
// ready to show. Pure (no fetch), so client and server code can both use it.

export type AppErrorKind =
    | "validation"
    | "unauthenticated"
    | "forbidden"
    | "not_found"
    | "conflict"
    | "too_large"
    | "rate_limited"
    | "server"
    | "offline"
    | "timeout";

export interface AppError {
    kind: AppErrorKind;
    /** Arabic, ready to show. */
    message: string;
    /** Validation only: field name → messages (Laravel's `errors`). */
    fieldErrors?: Record<string, string[]>;
    /** HTTP status, when the error came from the API. */
    status?: number;
}

/** What every dashboard data call returns: never throws for expected failures. */
export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const fail = <T = never>(error: AppError): Result<T> => ({ ok: false, error });

/** Default message per kind (used when the backend sends none in Arabic). */
export const ERROR_MESSAGES: Record<AppErrorKind, string> = {
    validation: "في معلومات ناقصة أو غلط، شوف الحقول المعلّمة بالأحمر",
    unauthenticated: "انتهت الجلسة، سجّل دخول من جديد",
    forbidden: "ما عندك صلاحية لهالتعديل",
    not_found: "هالعنصر ما عاد موجود، يمكن انحذف",
    conflict: "في حدا عدّل هالعنصر قبلك. حدّث الصفحة لتشوف آخر نسخة",
    too_large: "الملف كبير، اختار صورة أصغر من 5MB",
    rate_limited: "محاولات كتير، جرّب بعد دقيقة",
    server: "صار خلل عندنا، جرّب كمان شوي",
    offline: "ما في اتصال بالإنترنت. تعديلاتك لسا هون",
    timeout: "الاتصال بطيء، ما وصلنا رد",
};

export function appError(kind: AppErrorKind, overrides: Partial<Omit<AppError, "kind">> = {}): AppError {
    return { kind, message: ERROR_MESSAGES[kind], ...overrides };
}

const STATUS_KINDS: Record<number, AppErrorKind> = {
    401: "unauthenticated",
    403: "forbidden",
    404: "not_found",
    409: "conflict",
    413: "too_large",
    422: "validation",
    429: "rate_limited",
};

/** Arabic letters: the backend's message is shown only when it's in Arabic. */
const ARABIC = /[؀-ۿ]/;

/**
 * A failed HTTP response → AppError. `body` is the parsed JSON, if any.
 * Laravel's default shape: { message, errors?: { field: [messages] } }.
 */
export function fromHttpResponse(status: number, body: unknown): AppError {
    // Anything unexpected (5xx, odd 4xx) is shown as "our side failed, retry"
    const kind = STATUS_KINDS[status] ?? "server";
    const { message, errors } = (typeof body === "object" && body !== null ? body : {}) as {
        message?: unknown;
        errors?: unknown;
    };

    const fieldErrors = kind === "validation" ? parseFieldErrors(errors) : undefined;
    const backendMessage = typeof message === "string" && ARABIC.test(message) ? message : undefined;

    return appError(kind, {
        status,
        // For validation the fields carry the details; keep the generic summary
        message: kind === "validation" ? ERROR_MESSAGES.validation : (backendMessage ?? ERROR_MESSAGES[kind]),
        ...(fieldErrors ? { fieldErrors } : {}),
    });
}

/** Shown under a field when the backend's message isn't in Arabic. */
const FIELD_FALLBACK = "تأكد من هالحقل";

function parseFieldErrors(errors: unknown): Record<string, string[]> | undefined {
    if (typeof errors !== "object" || errors === null) return undefined;

    const entries = Object.entries(errors as Record<string, unknown>)
        .map(([field, messages]) => [
            field,
            Array.isArray(messages)
                ? messages
                      .filter((item): item is string => typeof item === "string")
                      .map((item) => (ARABIC.test(item) ? item : FIELD_FALLBACK))
                : [],
        ] as const)
        .filter(([, messages]) => messages.length > 0);

    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

/** First message for a field, or undefined. */
export function fieldError(error: AppError | undefined, field: string): string | undefined {
    return error?.fieldErrors?.[field]?.[0];
}
